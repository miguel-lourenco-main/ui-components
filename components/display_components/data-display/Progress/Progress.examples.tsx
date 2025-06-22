import React, { useState, useEffect } from 'react';
import ProgressComponent from './Progress';

// Example 1: Basic Progress
export const BasicProgress = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Basic Progress</h3>
    <ProgressComponent value={33} />
  </div>
);

// Example 2: Animated Progress
export const AnimatedProgress = () => {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Animated Progress</h3>
      <ProgressComponent value={progress} />
    </div>
  );
};

// Example 3: Progress with Percentage
export const ProgressWithPercentage = () => {
  const progress = 75;
  
  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Progress with Percentage</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Loading...</span>
          <span>{progress}%</span>
        </div>
        <ProgressComponent value={progress} />
      </div>
    </div>
  );
};

// Example 4: Multiple Progress Bars
export const MultipleProgress = () => {
  const tasks = [
    { name: 'Download', progress: 100 },
    { name: 'Install', progress: 80 },
    { name: 'Configure', progress: 45 },
    { name: 'Test', progress: 0 },
  ];

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Multiple Tasks</h3>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{task.name}</span>
              <span>{task.progress}%</span>
            </div>
            <ProgressComponent value={task.progress} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Export all examples
export const examples = [
  {
    name: 'Basic Progress',
    component: BasicProgress,
  },
  {
    name: 'Animated Progress',
    component: AnimatedProgress,
  },
  {
    name: 'Progress with Percentage',
    component: ProgressWithPercentage,
  },
  {
    name: 'Multiple Progress Bars',
    component: MultipleProgress,
  },
]; 