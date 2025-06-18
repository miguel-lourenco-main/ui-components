import React from 'react';
import SkeletonComponent from './Skeleton';

// Example 1: Basic Skeleton
export const BasicSkeleton = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Basic Skeleton</h3>
    <div className="flex items-center space-x-4">
      <SkeletonComponent className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <SkeletonComponent className="h-4 w-[250px]" />
        <SkeletonComponent className="h-4 w-[200px]" />
      </div>
    </div>
  </div>
);

// Example 2: Card Skeleton
export const CardSkeleton = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Card Skeleton</h3>
    <div className="flex flex-col space-y-3">
      <SkeletonComponent className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <SkeletonComponent className="h-4 w-[250px]" />
        <SkeletonComponent className="h-4 w-[200px]" />
      </div>
    </div>
  </div>
);

// Example 3: Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Profile Skeleton</h3>
    <div className="p-4 max-w-md border rounded-lg">
      <SkeletonComponent className="w-20 h-20 rounded-full mb-4" />
      <SkeletonComponent className="h-6 w-3/5 mb-2" />
      <SkeletonComponent className="h-4 w-full mb-1" />
      <SkeletonComponent className="h-4 w-4/5 mb-1" />
      <SkeletonComponent className="h-4 w-3/4 mb-1" />
    </div>
  </div>
);

// Example 4: List Skeleton
export const ListSkeleton = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">List Skeleton</h3>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <SkeletonComponent className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <SkeletonComponent className="h-4 w-full" />
            <SkeletonComponent className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Example 5: Text Block Skeleton
export const TextBlockSkeleton = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Text Block Skeleton</h3>
    <div className="space-y-2">
      <SkeletonComponent className="h-4 w-full" />
      <SkeletonComponent className="h-4 w-full" />
      <SkeletonComponent className="h-4 w-3/4" />
      <SkeletonComponent className="h-4 w-full" />
      <SkeletonComponent className="h-4 w-2/3" />
    </div>
  </div>
);

// Export all examples
export const examples = [
  {
    name: 'Basic Skeleton',
    component: BasicSkeleton,
  },
  {
    name: 'Card Skeleton',
    component: CardSkeleton,
  },
  {
    name: 'Profile Skeleton',
    component: ProfileSkeleton,
  },
  {
    name: 'List Skeleton',
    component: ListSkeleton,
  },
  {
    name: 'Text Block Skeleton',
    component: TextBlockSkeleton,
  },
]; 