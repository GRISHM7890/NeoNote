
'use client';

import React from 'react';
import { type MindmapNode as MindmapNodeType } from '@/ai/flows/ai-mindmap-generator';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface MindmapNodeProps {
  node: MindmapNodeType;
  level?: number;
}

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

export const MindmapNode: React.FC<MindmapNodeProps> = ({ node, level = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = level === 0;

  const nodeStyle = cn(
    "p-2 px-4 rounded-lg shadow-md w-max max-w-xs text-center border text-sm",
    {
      "bg-primary text-primary-foreground border-primary-foreground/20 text-base font-bold": isRoot,
      "bg-secondary text-secondary-foreground border-border": level === 1,
      "bg-accent/20 text-accent-foreground border-accent/30": level > 1,
    }
  );

  return (
    <motion.div 
      variants={nodeVariants} 
      custom={level}
      className="relative flex items-center"
    >
      {/* Horizontal line connecting to parent */}
      {!isRoot && <div className="w-8 h-0.5 bg-border"></div>}

      <div className="flex flex-col items-center">
        <Card className={nodeStyle}>
          {node.title}
        </Card>

        {hasChildren && (
          <div className="flex items-start">
            {/* Vertical line going down from the node */}
            <div className="w-0.5 h-8 bg-border"></div>

            <div className="pl-8 pt-8 space-y-4 relative">
              {/* Vertical line connecting all children of this node */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border translate-x-4"></div>
              
              {node.children!.map((child, index) => (
                <MindmapNode key={index} node={child} level={level + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface MindmapDisplayProps {
    node: MindmapNodeType;
}

export const MindmapDisplay: React.FC<MindmapDisplayProps> = ({ node }) => {
    return (
        <div className="flex p-4 min-w-full justify-start overflow-auto">
            <motion.div
                initial="hidden"
                animate="visible"
                className="inline-block"
            >
                <MindmapNode node={node} level={0} />
            </motion.div>
        </div>
    )
}
