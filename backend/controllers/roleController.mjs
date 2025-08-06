import asyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import Role from "../models/Role.mjs";

// Activity logging helper
const logRoleActivity = async (action, entity, details, req) => {
  try {
    // Import here to avoid circular dependency
    const { logActivity } = await import('./activityController.mjs');
    
    await logActivity({
      userId: req.user._id,
      action,
      entity: 'role',
      entityId: details.roleId || details._id,
      description: details.description || `${action} performed on role`,
      metadata: {
        ...details,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      },
      severity: details.severity || 'medium',
      req
    });
  } catch (error) {
    console.error('Failed to log role activity:', error);
  }
};

// Initialize system roles if they don't exist
const initializeSystemRoles = async () => {
  try {
    // Check if system roles exist
    const existingRoles = await Role.find({ isSystemRole: true });
    
    if (existingRoles.length === 0) {
      const systemRoles = [
        {
          name: 'admin',
          displayName: 'Administrator',
          description: 'Full system access with all permissions',
          permissions: [
            'news.create', 'news.read', 'news.update', 'news.delete', 'news.publish', 'news.moderate',
            'users.create', 'users.read', 'users.update', 'users.delete', 'users.roles', 'users.moderate',
            'categories.create', 'categories.read', 'categories.update', 'categories.delete',
            'comments.create', 'comments.read', 'comments.update', 'comments.delete', 'comments.moderate',
            'likes.create', 'likes.read', 'likes.delete',
            'analytics.view', 'analytics.export',
            'admin.dashboard', 'admin.settings', 'admin.logs', 'admin.security', 'admin.roles', 'admin.system',
            'reports.view', 'reports.export', 'reports.create',
            'notifications.create', 'notifications.read', 'notifications.update', 'notifications.delete', 'notifications.broadcast'
          ],
          level: 100,
          isSystemRole: true,
          color: '#dc2626'
        },
        {
          name: 'editor',
          displayName: 'Editor',
          description: 'Content management and moderation permissions',
          permissions: [
            'news.create', 'news.read', 'news.update', 'news.publish', 'news.moderate',
            'categories.create', 'categories.read', 'categories.update',
            'comments.read', 'comments.moderate',
            'likes.read',
            'analytics.view',
            'reports.view'
          ],
          level: 50,
          isSystemRole: true,
          color: '#2563eb'
        },
        {
          name: 'user',
          displayName: 'User',
          description: 'Basic user permissions for content interaction',
          permissions: [
            'news.read',
            'categories.read',
            'comments.create', 'comments.read', 'comments.update',
            'likes.create', 'likes.read',
            'notifications.read'
          ],
          level: 10,
          isSystemRole: true,
          color: '#059669'
        }
      ];
      
      await Role.insertMany(systemRoles);
      console.log('System roles initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing system roles:', error);
  }
};

// Initialize system roles
initializeSystemRoles();

// @desc    Get all roles
// @route   GET /api/admin/roles
// @access  Private/Admin
export const getRoles = asyncHandler(async (req, res) => {
  try {
    const { active } = req.query;
    
    // Build query
    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    // Fetch roles and populate user counts
    const roles = await Role.find(query)
      .populate('userCount')
      .sort({ level: -1, name: 1 });

    // Calculate actual user counts
    const rolesWithUserCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role.name });
        return {
          ...role.toObject(),
          userCount
        };
      })
    );

    res.json({
      success: true,
      roles: rolesWithUserCounts,
      total: rolesWithUserCounts.length
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch roles');
  }
});

// @desc    Create a new role
// @route   POST /api/admin/roles
// @access  Private/Admin
export const createRole = asyncHandler(async (req, res) => {
  const { name, displayName, description, permissions, level, color } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Role name is required');
  }

  if (!displayName || !displayName.trim()) {
    res.status(400);
    throw new Error('Display name is required');
  }

  // Validate permissions
  const availablePermissions = Role.getAvailablePermissions();
  const invalidPermissions = permissions?.filter(p => !availablePermissions.includes(p)) || [];
  
  if (invalidPermissions.length > 0) {
    res.status(400);
    throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
  }

  // Check if role name already exists
  const existingRole = await Role.findOne({ 
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
  });

  if (existingRole) {
    res.status(400);
    throw new Error('Role with this name already exists');
  }

  const newRole = await Role.create({
    name: name.trim().toLowerCase(),
    displayName: displayName.trim(),
    description: description || '',
    permissions: permissions || [],
    level: level || 10,
    color: color || '#6b7280',
    isSystemRole: false
  });

  // Log activity
  await logRoleActivity('role.create', 'role', {
    roleId: newRole._id,
    roleName: newRole.name,
    displayName: newRole.displayName,
    permissions: newRole.permissions,
    description: `Created new role: ${newRole.displayName}`,
    severity: 'medium'
  }, req);

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    role: newRole
  });
});

// @desc    Update a role
// @route   PUT /api/admin/roles/:id
// @access  Private/Admin
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, displayName, description, permissions, level, color, isActive } = req.body;

  const role = await Role.findById(id);

  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  // Prevent modification of system role names
  if (role.isSystemRole && name && name !== role.name) {
    res.status(400);
    throw new Error('Cannot modify system role name');
  }

  // Validate permissions if provided
  if (permissions) {
    const availablePermissions = Role.getAvailablePermissions();
    const invalidPermissions = permissions.filter(p => !availablePermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      res.status(400);
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }
  }

  // Check for duplicate names (excluding current role)
  if (name && name !== role.name) {
    const existingRole = await Role.findOne({ 
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingRole) {
      res.status(400);
      throw new Error('Role with this name already exists');
    }
  }

  // Update role fields
  if (name !== undefined && !role.isSystemRole) role.name = name.trim().toLowerCase();
  if (displayName !== undefined) role.displayName = displayName.trim();
  if (description !== undefined) role.description = description;
  if (permissions !== undefined) role.permissions = permissions;
  if (level !== undefined) role.level = level;
  if (color !== undefined) role.color = color;
  if (isActive !== undefined) role.isActive = isActive;

  const updatedRole = await role.save();

  // Log activity
  await logRoleActivity('role.update', 'role', {
    roleId: updatedRole._id,
    roleName: updatedRole.name,
    displayName: updatedRole.displayName,
    changes: {
      name: name !== undefined ? name : undefined,
      displayName: displayName !== undefined ? displayName : undefined,
      description: description !== undefined ? description : undefined,
      permissions: permissions !== undefined ? permissions : undefined,
      level: level !== undefined ? level : undefined,
      color: color !== undefined ? color : undefined,
      isActive: isActive !== undefined ? isActive : undefined
    },
    description: `Updated role: ${updatedRole.displayName}`,
    severity: 'medium'
  }, req);

  res.json({
    success: true,
    message: 'Role updated successfully',
    role: updatedRole
  });
});

// @desc    Delete a role
// @route   DELETE /api/admin/roles/:id
// @access  Private/Admin
export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reassignTo } = req.body;

  const role = await Role.findById(id);

  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  // Prevent deletion of system roles
  if (role.isSystemRole) {
    res.status(400);
    throw new Error('Cannot delete system roles');
  }

  // Check if role is in use
  const usersWithRole = await User.countDocuments({ role: role.name });
  
  if (usersWithRole > 0) {
    if (!reassignTo) {
      res.status(400);
      throw new Error(`Cannot delete role. ${usersWithRole} user(s) currently have this role. Please specify a role to reassign users to.`);
    }

    // Validate reassignment role
    const reassignRole = await Role.findById(reassignTo);
    if (!reassignRole) {
      res.status(400);
      throw new Error('Reassignment role not found');
    }

    // Reassign users to new role
    await User.updateMany(
      { role: role.name },
      { role: reassignRole.name }
    );
  }

  await Role.findByIdAndDelete(id);

  // Log activity
  await logRoleActivity('role.delete', 'role', {
    roleId: id,
    roleName: role.name,
    displayName: role.displayName,
    usersAffected: usersWithRole,
    reassignedTo: reassignRole ? reassignRole.displayName : null,
    description: `Deleted role: ${role.displayName}${usersWithRole > 0 ? ` (${usersWithRole} users reassigned)` : ''}`,
    severity: 'high'
  }, req);

  res.json({
    success: true,
    message: usersWithRole > 0 
      ? `Role deleted successfully. ${usersWithRole} user(s) reassigned to ${reassignRole.displayName}.`
      : 'Role deleted successfully'
  });
});

// @desc    Get role by ID
// @route   GET /api/admin/roles/:id
// @access  Private/Admin
export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findById(id);

  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  // Get current user count and users
  const userCount = await User.countDocuments({ role: role.name });
  const users = await User.find({ role: role.name })
    .select('username email profileImage createdAt')
    .limit(10)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    role: {
      ...role.toObject(),
      userCount,
      recentUsers: users
    }
  });
});

// @desc    Assign role to user
// @route   PUT /api/admin/roles/:roleId/assign/:userId
// @access  Private/Admin
export const assignRoleToUser = asyncHandler(async (req, res) => {
  const { roleId, userId } = req.params;

  const role = await Role.findById(roleId);
  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  if (!role.isActive) {
    res.status(400);
    throw new Error('Cannot assign inactive role');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const previousRole = user.role;
  user.role = role.name;
  await user.save();

  // Log activity
  await logRoleActivity('role.assign', 'role', {
    roleId: role._id,
    roleName: role.name,
    displayName: role.displayName,
    userId: user._id,
    username: user.username,
    userEmail: user.email,
    previousRole,
    newRole: role.name,
    description: `Assigned role "${role.displayName}" to user ${user.username}`,
    severity: 'medium'
  }, req);

  res.json({
    success: true,
    message: `Role "${role.displayName}" assigned to user successfully`,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      previousRole
    }
  });
});

// @desc    Get available permissions
// @route   GET /api/admin/roles/permissions
// @access  Private/Admin
export const getAvailablePermissions = asyncHandler(async (req, res) => {
  const permissions = Role.getAvailablePermissions();
  
  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const [category] = permission.split('.');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  res.json({
    success: true,
    permissions: groupedPermissions,
    total: permissions.length
  });
});

// @desc    Bulk assign roles to users
// @route   POST /api/admin/roles/bulk-assign
// @access  Private/Admin
export const bulkAssignRole = asyncHandler(async (req, res) => {
  const { roleId, userIds } = req.body;

  if (!roleId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    res.status(400);
    throw new Error('Role ID and user IDs array are required');
  }

  const role = await Role.findById(roleId);
  if (!role) {
    res.status(404);
    throw new Error('Role not found');
  }

  if (!role.isActive) {
    res.status(400);
    throw new Error('Cannot assign inactive role');
  }

  // Update users
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { role: role.name }
  );

  if (result.matchedCount === 0) {
    res.status(404);
    throw new Error('No users found with the provided IDs');
  }

  // Log activity
  await logRoleActivity('role.bulk_assign', 'role', {
    roleId: role._id,
    roleName: role.name,
    displayName: role.displayName,
    userIds,
    usersModified: result.modifiedCount,
    totalRequested: userIds.length,
    description: `Bulk assigned role "${role.displayName}" to ${result.modifiedCount} user(s)`,
    severity: 'medium'
  }, req);

  res.json({
    success: true,
    message: `Role "${role.displayName}" assigned to ${result.modifiedCount} user(s)`,
    assigned: result.modifiedCount,
    total: userIds.length
  });
});

// @desc    Get role statistics
// @route   GET /api/admin/roles/stats
// @access  Private/Admin
export const getRoleStats = asyncHandler(async (req, res) => {
  const totalRoles = await Role.countDocuments();
  const activeRoles = await Role.countDocuments({ isActive: true });
  const systemRoles = await Role.countDocuments({ isSystemRole: true });
  
  // Get role distribution
  const roleDistribution = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'roles',
        localField: '_id',
        foreignField: 'name',
        as: 'roleInfo'
      }
    },
    {
      $project: {
        role: '$_id',
        count: 1,
        displayName: { $arrayElemAt: ['$roleInfo.displayName', 0] },
        color: { $arrayElemAt: ['$roleInfo.color', 0] }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.json({
    success: true,
    stats: {
      totalRoles,
      activeRoles,
      systemRoles,
      customRoles: totalRoles - systemRoles,
      roleDistribution
    }
  });
});