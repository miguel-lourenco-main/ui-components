/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './public/**/*.js',
    // Include any files that might contain dynamic class generation
    './registry/**/*.{js,ts,jsx,tsx,json}',
  ],
  safelist: [
    // Background colors - all shades
    {
      pattern: /bg-(red|blue|green|yellow|purple|pink|indigo|gray|orange|teal|cyan|emerald|lime|amber|violet|fuchsia|rose|sky|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)/
    },
    // Text colors - all shades
    {
      pattern: /text-(red|blue|green|yellow|purple|pink|indigo|gray|orange|teal|cyan|emerald|lime|amber|violet|fuchsia|rose|sky|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)/
    },
    // Border colors - all shades
    {
      pattern: /border-(red|blue|green|yellow|purple|pink|indigo|gray|orange|teal|cyan|emerald|lime|amber|violet|fuchsia|rose|sky|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)/
    },
    // Width classes - standard sizes
    'w-auto', 'w-full', 'w-screen', 'w-min', 'w-max', 'w-fit',
    'w-0', 'w-px', 'w-0.5', 'w-1', 'w-1.5', 'w-2', 'w-2.5', 'w-3', 'w-3.5', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-11', 'w-12', 'w-14', 'w-16', 'w-20', 'w-24', 'w-28', 'w-32', 'w-36', 'w-40', 'w-44', 'w-48', 'w-52', 'w-56', 'w-60', 'w-64', 'w-72', 'w-80', 'w-96',
    'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-2/4', 'w-3/4', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-1/6', 'w-5/6', 'w-1/12', 'w-2/12', 'w-3/12', 'w-4/12', 'w-5/12', 'w-6/12', 'w-7/12', 'w-8/12', 'w-9/12', 'w-10/12', 'w-11/12',
    'w-[50px]', 'w-[100px]', 'w-[150px]', 'w-[200px]', 'w-[220px]', 'w-[250px]', 'w-[300px]', 
    'w-[50%]', 'w-[60%]', 'w-[70%]', 'w-[80%]', 'w-[90%]','w-[25%]', 'w-[75%]', 'w-[10%]', 'w-[20%]', 'w-[30%]', 'w-[40%]', 'w-[5%]', 'w-[6%]', 'w-[7%]', 'w-[8%]', 'w-[9%]',
	
	// Height classes - standard sizes
	
    'h-auto', 'h-full', 'h-screen', 'h-min', 'h-max', 'h-fit',
    'h-0', 'h-px', 'h-0.5', 'h-1', 'h-1.5', 'h-2', 'h-2.5', 'h-3', 'h-3.5', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-9', 'h-10', 'h-11', 'h-12', 'h-14', 'h-16', 'h-20', 'h-24', 'h-28', 'h-32', 'h-36', 'h-40', 'h-44', 'h-48', 'h-52', 'h-56', 'h-60', 'h-64', 'h-72', 'h-80', 'h-96',
    'h-1/2', 'h-1/3', 'h-2/3', 'h-1/4', 'h-2/4', 'h-3/4', 'h-1/5', 'h-2/5', 'h-3/5', 'h-4/5', 'h-1/6', 'h-5/6',
    'h-[50px]', 'h-[100px]', 'h-[150px]', 'h-[200px]', 'h-[250px]', 'h-[300px]', 
    'h-[50%]', 'h-[60%]', 'h-[70%]', 'h-[80%]', 'h-[90%]', 'h-[10%]', 'h-[20%]', 'h-[30%]', 'h-[40%]', 'h-[5%]', 'h-[6%]', 'h-[7%]', 'h-[8%]', 'h-[9%]',
    
	// Border radius
    'rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
    // Text sizes
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
    // Standard size classes (xs, sm, md, lg, xl, etc.)
    'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
    // Spacing (padding, margin) - common values
    'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16', 'p-20', 'p-24',
    'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16',
    'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8', 'py-10', 'py-12', 'py-16',
    'pt-0', 'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-8', 'pt-10', 'pt-12', 'pt-16',
    'pb-0', 'pb-1', 'pb-2', 'pb-3', 'pb-4', 'pb-5', 'pb-6', 'pb-8', 'pb-10', 'pb-12', 'pb-16',
    'pl-0', 'pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-5', 'pl-6', 'pl-8', 'pl-10', 'pl-12', 'pl-16',
    'pr-0', 'pr-1', 'pr-2', 'pr-3', 'pr-4', 'pr-5', 'pr-6', 'pr-8', 'pr-10', 'pr-12', 'pr-16',
    'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16', 'm-20', 'm-24',
    'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-10', 'mx-12', 'mx-16',
    'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-10', 'my-12', 'my-16',
    'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-8', 'mt-10', 'mt-12', 'mt-16',
    'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-8', 'mb-10', 'mb-12', 'mb-16',
    'ml-0', 'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-8', 'ml-10', 'ml-12', 'ml-16',
    'mr-0', 'mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-5', 'mr-6', 'mr-8', 'mr-10', 'mr-12', 'mr-16',
    // Flexbox and grid
    'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden', 'block', 'inline-block', 'inline',
    'flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap',
    'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
    'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',
    'gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8', 'gap-10', 'gap-12', 'gap-16',
    'gap-x-0', 'gap-x-1', 'gap-x-2', 'gap-x-3', 'gap-x-4', 'gap-x-5', 'gap-x-6', 'gap-x-8',
    'gap-y-0', 'gap-y-1', 'gap-y-2', 'gap-y-3', 'gap-y-4', 'gap-y-5', 'gap-y-6', 'gap-y-8',
    // Text alignment and sizing
    'text-left', 'text-center', 'text-right', 'text-justify',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
    // Font weights
    'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
    // Position
    'static', 'fixed', 'absolute', 'relative', 'sticky',
    // Shadow
    'shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner',
    // Opacity
    'opacity-0', 'opacity-5', 'opacity-10', 'opacity-20', 'opacity-25', 'opacity-30', 'opacity-40', 'opacity-50', 
    'opacity-60', 'opacity-70', 'opacity-75', 'opacity-80', 'opacity-90', 'opacity-95', 'opacity-100',
    // Transform and transitions
    'transform', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-transform',
    'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
    // Common hover states
    'hover:bg-red-50', 'hover:bg-red-100', 'hover:bg-red-200', 'hover:bg-red-300', 'hover:bg-red-400', 'hover:bg-red-500', 'hover:bg-red-600', 'hover:bg-red-700', 'hover:bg-red-800', 'hover:bg-red-900',
    'hover:bg-blue-50', 'hover:bg-blue-100', 'hover:bg-blue-200', 'hover:bg-blue-300', 'hover:bg-blue-400', 'hover:bg-blue-500', 'hover:bg-blue-600', 'hover:bg-blue-700', 'hover:bg-blue-800', 'hover:bg-blue-900',
    'hover:bg-green-50', 'hover:bg-green-100', 'hover:bg-green-200', 'hover:bg-green-300', 'hover:bg-green-400', 'hover:bg-green-500', 'hover:bg-green-600', 'hover:bg-green-700', 'hover:bg-green-800', 'hover:bg-green-900',
    'hover:bg-gray-50', 'hover:bg-gray-100', 'hover:bg-gray-200', 'hover:bg-gray-300', 'hover:bg-gray-400', 'hover:bg-gray-500', 'hover:bg-gray-600', 'hover:bg-gray-700', 'hover:bg-gray-800', 'hover:bg-gray-900',
    'hover:text-red-500', 'hover:text-red-600', 'hover:text-red-700', 'hover:text-blue-500', 'hover:text-blue-600', 'hover:text-blue-700',
    'hover:text-green-500', 'hover:text-green-600', 'hover:text-green-700', 'hover:text-gray-500', 'hover:text-gray-600', 'hover:text-gray-700',
    // Common utility classes
    'cursor-pointer', 'cursor-default', 'cursor-not-allowed',
    'overflow-hidden', 'overflow-auto', 'overflow-scroll', 'overflow-visible',
    'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap',
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 