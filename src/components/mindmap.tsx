
'use client';

import React from 'react';
import { type MindmapNode as MindmapNodeType } from '@/ai/flows/ai-mindmap-generator';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';

interface MindmapNodeProps {
  node: MindmapNodeType;
  isRoot?: boolean;
}

const nodeVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

export const MindmapNode: React.FC<MindmapNodeProps> = ({ node, isRoot = false }) => {
  return (
    <motion.li variants={nodeVariants} className="flex flex-col items-center relative">
      <Card
        className={`
          p-2 px-4 rounded-lg shadow-md mb-4
          ${isRoot ? 'bg-primary text-primary-foreground border-primary-foreground/20' : 'bg-secondary text-secondary-foreground border-border'}
        `}
      >
        <h3 className={`text-center font-semibold ${isRoot ? 'text-lg' : 'text-sm'}`}>
          {node.title}
        </h3>
      </Card>

      {node.children && node.children.length > 0 && (
        <>
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-x-8 gap-y-4 relative"
          >
            {node.children.map((child, index) => (
              <MindmapNode key={index} node={child} />
            ))}
          </motion.ul>
        </>
      )}
    </motion.li>
  );
};


interface MindmapDisplayProps {
    node: MindmapNodeType;
}

export const MindmapDisplay: React.FC<MindmapDisplayProps> = ({ node }) => {
    return (
        <div className="flex justify-center p-4">
            <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="list-none p-0"
            >
                <MindmapNode node={node} isRoot />
            </motion.ul>
        </div>
    )
}
