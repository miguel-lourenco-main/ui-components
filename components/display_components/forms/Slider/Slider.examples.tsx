import React, { useState } from 'react';
import SliderComponent from './Slider';

// Example 1: Basic Slider
export const BasicSlider = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Basic Slider</h3>
    <SliderComponent defaultValue={[33]} />
  </div>
);

// Example 2: Slider with Value Display
export const SliderWithValue = () => {
  const [value, setValue] = useState([50]);

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Slider with Value Display</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Value</span>
          <span>{value[0]}</span>
        </div>
        <SliderComponent
          value={value}
          onValueChange={setValue}
        />
      </div>
    </div>
  );
};

// Example 3: Range Slider
export const RangeSlider = () => {
  const [value, setValue] = useState([25, 75]);

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Range Slider</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Range</span>
          <span>{value[0]} - {value[1]}</span>
        </div>
        <SliderComponent
          value={value}
          onValueChange={setValue}
          defaultValue={[25, 75]}
        />
      </div>
    </div>
  );
};

// Example 4: Stepped Slider
export const SteppedSlider = () => {
  const [value, setValue] = useState([20]);

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Stepped Slider (Step: 10)</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Value</span>
          <span>{value[0]}</span>
        </div>
        <SliderComponent
          value={value}
          onValueChange={setValue}
          step={10}
          max={100}
          min={0}
        />
      </div>
    </div>
  );
};

// Example 5: Price Range Slider
export const PriceRangeSlider = () => {
  const [priceRange, setPriceRange] = useState([200, 800]);

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Price Range</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Price Range</span>
          <span>${priceRange[0]} - ${priceRange[1]}</span>
        </div>
        <SliderComponent
          value={priceRange}
          onValueChange={setPriceRange}
          max={1000}
          min={0}
          step={50}
        />
      </div>
    </div>
  );
};

// Example 6: Disabled Slider
export const DisabledSlider = () => (
  <div className="w-full max-w-md space-y-4">
    <h3 className="text-lg font-semibold">Disabled Slider</h3>
    <SliderComponent defaultValue={[60]} disabled />
  </div>
);

// Export all examples
export const examples = [
  {
    name: 'Basic Slider',
    component: BasicSlider,
  },
  {
    name: 'Slider with Value Display',
    component: SliderWithValue,
  },
  {
    name: 'Range Slider',
    component: RangeSlider,
  },
  {
    name: 'Stepped Slider',
    component: SteppedSlider,
  },
  {
    name: 'Price Range Slider',
    component: PriceRangeSlider,
  },
  {
    name: 'Disabled Slider',
    component: DisabledSlider,
  },
]; 