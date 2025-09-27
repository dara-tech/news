'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FuturisticActionButton from './FuturisticActionButton';
import FuturisticShareButton from './FuturisticShareButton';

const FuturisticFeaturesDemo: React.FC = () => {
  const [likeCount, setLikeCount] = useState(42);
  const [commentCount, setCommentCount] = useState(18);
  const [saveCount, setSaveCount] = useState(7);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleComment = () => {
    setIsCommented(!isCommented);
    setCommentCount(prev => isCommented ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    setSaveCount(prev => isSaved ? prev - 1 : prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Futuristic Action Buttons
        </h2>
        <p className="text-muted-foreground">
          Experience the next generation of social interactions with smooth animations and micro-interactions
        </p>
      </motion.div>

      {/* Demo Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg"
      >
        <div className="space-y-4">
          <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-sm text-muted-foreground">Demo Article Card</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Futuristic UI Components</h3>
            <p className="text-muted-foreground">
              Experience smooth animations, dynamic counts, and engaging micro-interactions that make every click feel satisfying.
            </p>
          </div>

          {/* Action Buttons Demo */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <FuturisticActionButton
                type="like"
                count={likeCount}
                isActive={isLiked}
                onClick={handleLike}
              />
              
              <FuturisticActionButton
                type="comment"
                count={commentCount}
                isActive={isCommented}
                onClick={handleComment}
              />
              
              <FuturisticShareButton
                articleTitle="Futuristic UI Components"
                articleUrl="/demo/futuristic-ui"
              />
            </div>

            <FuturisticActionButton
              type="save"
              count={saveCount}
              isActive={isSaved}
              onClick={handleSave}
              className="ml-2"
            />
          </div>
        </div>
      </motion.div>

      {/* Features List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-red-500">❤️ Like Button</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Heart animation on click</li>
            <li>• Dynamic count updates</li>
            <li>• Red gradient glow effect</li>
            <li>• Sparkle particles</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-blue-500">💬 Comment Button</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Smooth scale animations</li>
            <li>• Blue gradient effects</li>
            <li>• Real-time count changes</li>
            <li>• Hover micro-interactions</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-amber-500">🔖 Save Button</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Bookmark fill animation</li>
            <li>• Amber glow effects</li>
            <li>• Ripple animations</li>
            <li>• State persistence</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-cyan-500">📤 Share Button</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Native share API support</li>
            <li>• Clipboard fallback</li>
            <li>• Success feedback</li>
            <li>• Copy confirmation</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default FuturisticFeaturesDemo;
