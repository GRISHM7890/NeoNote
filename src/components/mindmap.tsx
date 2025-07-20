
'use client';

import React from 'react';
import { type MindmapNode as MindmapNodeType } from '@/ai/flows/ai-mindmap-generator';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface MindmapNodeProps {
  node: MindmapNodeType;
  isRoot?: boolean;
}

const nodeVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const MindmapNode: React.FC<MindmapNodeProps> = ({ node, isRoot = false }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <motion.li
      variants={nodeVariants}
      className={cn(
        "flex flex-col items-center relative",
        !isRoot && "pt-12" // Space for connecting lines
      )}
    >
      <Card
        className={cn(
          "p-2 px-4 rounded-lg shadow-md z-10 w-max max-w-xs text-center",
          isRoot
            ? "bg-primary text-primary-foreground border-primary-foreground/20"
            : "bg-secondary text-secondary-foreground border-border"
        )}
      >
        <h3 className={cn("font-semibold", isRoot ? "text-lg" : "text-sm")}>
          {node.title}
        </h3>
      </Card>
      
      {!isRoot && (
        <>
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 w-0.5 h-12 bg-border -translate-x-1/2"></div>
        </>
      )}

      {hasChildren && (
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center items-start gap-x-8 relative"
        >
           {/* Horizontal line connecting children */}
           {node.children.length > 1 && (
             <div className="absolute top-0 left-1/2 w-full h-0.5 bg-border -translate-x-1/2"></div>
           )}

          {node.children!.map((child, index) => (
            <MindmapNode key={index} node={child} />
          ))}
        </motion.ul>
      )}
    </motion.li>
  );
};

interface MindmapDisplayProps {
    node: MindmapNodeType;
}

export const MindmapDisplay: React.FC<MindmapDisplayProps> = ({ node }) => {
    return (
        <div className="flex justify-center p-4 min-w-full">
            <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="list-none p-0 inline-flex"
            >
                <MindmapNode node={node} isRoot />
            </motion.ul>
        </div>
    )
}
