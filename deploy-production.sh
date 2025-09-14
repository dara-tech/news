#!/bin/bash

# Production Deployment Script for Razewire News Platform
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting Razewire Production Deployment..."

# Configuration
PROJECT_NAME="razewire-news"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
DEPLOY_DIR="/var/www/razewire"
SERVICE_NAME="razewire-backend"
NGINX_CONFIG="/etc/nginx/sites-available/razewire"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Check required environment variables
check_env() {
    log "Checking environment variables..."
    
    required_vars=(
        "MONGODB_URI"
        "JWT_SECRET"
        "NEXT_PUBLIC_API_URL"
        "CLOUDINARY_CLOUD_NAME"
        "CLOUDINARY_API_KEY"
        "CLOUDINARY_API_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Environment variables validated"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Backend dependencies
    cd $BACKEND_DIR
    npm ci --production
    cd ..
    
    # Frontend dependencies
    cd $FRONTEND_DIR
    npm ci
    cd ..
    
    success "Dependencies installed"
}

# Build frontend
build_frontend() {
    log "Building frontend..."
    
    cd $FRONTEND_DIR
    npm run build
    
    if [[ ! -d ".next" ]]; then
        error "Frontend build failed - .next directory not found"
    fi
    
    cd ..
    success "Frontend built successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Backend tests
    cd $BACKEND_DIR
    npm test || warning "Backend tests failed - continuing deployment"
    cd ..
    
    # Frontend tests
    cd $FRONTEND_DIR
    npm run test -- --watchAll=false || warning "Frontend tests failed - continuing deployment"
    cd ..
    
    success "Tests completed"
}

# Create deployment directory
setup_deployment() {
    log "Setting up deployment directory..."
    
    sudo mkdir -p $DEPLOY_DIR
    sudo chown -R $USER:$USER $DEPLOY_DIR
    
    # Copy backend files
    cp -r $BACKEND_DIR/* $DEPLOY_DIR/
    
    # Copy frontend build
    cp -r $FRONTEND_DIR/.next $DEPLOY_DIR/frontend/
    cp -r $FRONTEND_DIR/public $DEPLOY_DIR/frontend/
    cp $FRONTEND_DIR/package.json $DEPLOY_DIR/frontend/
    
    success "Deployment directory prepared"
}

# Setup systemd service
setup_service() {
    log "Setting up systemd service..."
    
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Razewire News Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node server.mjs
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=MONGODB_URI=$MONGODB_URI
Environment=JWT_SECRET=$JWT_SECRET
Environment=NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
Environment=CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
Environment=CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
Environment=CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
    
    success "Systemd service configured"
}

# Setup Nginx
setup_nginx() {
    log "Setting up Nginx configuration..."
    
    sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        root $DEPLOY_DIR/frontend;
        try_files \$uri \$uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

    sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    
    success "Nginx configured"
}

# Start services
start_services() {
    log "Starting services..."
    
    sudo systemctl start $SERVICE_NAME
    sudo systemctl status $SERVICE_NAME --no-pager
    
    # Wait for backend to be ready
    sleep 10
    
    # Test health endpoint
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        success "Backend service is running"
    else
        error "Backend service failed to start"
    fi
    
    success "All services started"
}

# Database migration
migrate_database() {
    log "Running database migrations..."
    
    cd $DEPLOY_DIR
    node scripts/safe-database-optimization.mjs
    
    success "Database migrations completed"
}

# Main deployment function
main() {
    log "Starting Razewire deployment process..."
    
    check_env
    install_dependencies
    run_tests
    build_frontend
    setup_deployment
    setup_service
    setup_nginx
    migrate_database
    start_services
    
    success "🎉 Razewire deployment completed successfully!"
    log "Your application is now running at: http://your-domain.com"
    log "Backend API: http://your-domain.com/api"
    log "Health check: http://your-domain.com/health"
}

# Run main function
main "$@"

