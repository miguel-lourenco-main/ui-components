export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    light: {
      primary: string
      secondary: string
      accent: string
      background: string
      foreground: string
      muted: string
      border: string
    }
    dark: {
      primary: string
      secondary: string
      accent: string
      background: string
      foreground: string
      muted: string
      border: string
    }
  }
  styles: {
    borderRadius: string
    fontWeight: string
    spacing: string
  }
  components: {
    light: {
      button: {
        primary: string
        secondary: string
        outline: string
        ghost: string
      }
      card: {
        base: string
        header: string
        content: string
      }
      form: {
        input: string
        label: string
        focus: string
      }
      alert: {
        base: string
        text: string
      }
      badge: {
        base: string
        text: string
      }
    }
    dark: {
      button: {
        primary: string
        secondary: string
        outline: string
        ghost: string
      }
      card: {
        base: string
        header: string
        content: string
      }
      form: {
        input: string
        label: string
        focus: string
      }
      alert: {
        base: string
        text: string
      }
      badge: {
        base: string
        text: string
      }
    }
  }
}

export type ThemeMode = "light" | "dark"
export type ThemeComponentKey = keyof Theme["components"]["light"]

export const themes: Theme[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and understated design with subtle grays",
    colors: {
      light: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#9ca3af",
        background: "#ffffff",
        foreground: "#111827",
        muted: "#f9fafb",
        border: "#e5e7eb",
      },
      dark: {
        primary: "#f9fafb",
        secondary: "#9ca3af",
        accent: "#6b7280",
        background: "#111827",
        foreground: "#f9fafb",
        muted: "#1f2937",
        border: "#374151",
      },
    },
    styles: {
      borderRadius: "0.375rem",
      fontWeight: "400",
      spacing: "normal",
    },
    components: {
      light: {
        button: {
          primary: "bg-gray-900 hover:bg-gray-800 text-white border-0",
          secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border-0",
          outline: "border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent",
          ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        },
        card: {
          base: "space-y-2 border-gray-200 bg-white shadow-sm",
          header: "border-b border-gray-100",
          content: "text-gray-600",
        },
        form: {
          input: "border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white text-gray-900",
          label: "text-gray-700 font-medium",
          focus: "ring-gray-500",
        },
        alert: {
          base: "border-gray-200 bg-gray-50",
          text: "text-gray-800",
        },
        badge: {
          base: "bg-gray-100 text-gray-800 border-gray-200",
          text: "text-gray-800",
        },
      },
      dark: {
        button: {
          primary: "bg-gray-100 hover:bg-white text-gray-900 border-0",
          secondary: "bg-gray-800 hover:bg-gray-700 text-gray-100 border-0",
          outline: "border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent",
          ghost: "text-gray-400 hover:text-gray-100 hover:bg-gray-800",
        },
        card: {
          base: "border-gray-700 bg-gray-900 shadow-lg",
          header: "border-b border-gray-700",
          content: "text-gray-300",
        },
        form: {
          input: "border-gray-600 bg-gray-800 text-white focus:border-gray-400 focus:ring-gray-400",
          label: "text-gray-300 font-medium",
          focus: "ring-gray-400",
        },
        alert: {
          base: "border-gray-600 bg-gray-800",
          text: "text-gray-200",
        },
        badge: {
          base: "bg-gray-800 text-gray-200 border-gray-600",
          text: "text-gray-200",
        },
      },
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with blue accents and clean lines",
    colors: {
      light: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#06b6d4",
        background: "#ffffff",
        foreground: "#0f172a",
        muted: "#f8fafc",
        border: "#e2e8f0",
      },
      dark: {
        primary: "#60a5fa",
        secondary: "#94a3b8",
        accent: "#22d3ee",
        background: "#0f172a",
        foreground: "#f8fafc",
        muted: "#1e293b",
        border: "#334155",
      },
    },
    styles: {
      borderRadius: "0.5rem",
      fontWeight: "500",
      spacing: "comfortable",
    },
    components: {
      light: {
        button: {
          primary: "bg-blue-600 hover:bg-blue-700 text-white border-0",
          secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 border-0",
          outline: "border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent",
          ghost: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
        },
        card: {
          base: "border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow",
          header: "border-b border-slate-100",
          content: "text-slate-600",
        },
        form: {
          input: "border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-slate-900",
          label: "text-slate-700 font-medium",
          focus: "ring-blue-500",
        },
        alert: {
          base: "border-blue-200 bg-blue-50",
          text: "text-blue-800",
        },
        badge: {
          base: "bg-blue-100 text-blue-800 border-blue-200",
          text: "text-blue-800",
        },
      },
      dark: {
        button: {
          primary: "bg-blue-500 hover:bg-blue-400 text-white border-0",
          secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border-0",
          outline: "border-blue-400 text-blue-400 hover:bg-blue-950 bg-transparent",
          ghost: "text-blue-400 hover:text-blue-300 hover:bg-blue-950",
        },
        card: {
          base: "border-slate-700 bg-slate-900 shadow-lg hover:shadow-xl transition-shadow",
          header: "border-b border-slate-700",
          content: "text-slate-300",
        },
        form: {
          input: "border-slate-600 bg-slate-800 text-slate-100 focus:border-blue-400 focus:ring-blue-400",
          label: "text-slate-300 font-medium",
          focus: "ring-blue-400",
        },
        alert: {
          base: "border-blue-500 bg-blue-950",
          text: "text-blue-200",
        },
        badge: {
          base: "bg-blue-900 text-blue-200 border-blue-500",
          text: "text-blue-200",
        },
      },
    },
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Vibrant gradients and colorful accents",
    colors: {
      light: {
        primary: "#8b5cf6",
        secondary: "#ec4899",
        accent: "#06b6d4",
        background: "#ffffff",
        foreground: "#1e1b4b",
        muted: "#faf5ff",
        border: "#e9d5ff",
      },
      dark: {
        primary: "#a78bfa",
        secondary: "#f472b6",
        accent: "#22d3ee",
        background: "#1e1b4b",
        foreground: "#faf5ff",
        muted: "#312e81",
        border: "#6d28d9",
      },
    },
    styles: {
      borderRadius: "0.75rem",
      fontWeight: "600",
      spacing: "relaxed",
    },
    components: {
      light: {
        button: {
          primary:
            "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0",
          secondary:
            "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white border-0",
          outline: "border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent",
          ghost: "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
        },
        card: {
          base: "border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-sm",
          header: "border-b border-purple-100",
          content: "text-purple-700",
        },
        form: {
          input: "border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-purple-900",
          label: "text-purple-700 font-semibold",
          focus: "ring-purple-500",
        },
        alert: {
          base: "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50",
          text: "text-purple-800",
        },
        badge: {
          base: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200",
          text: "text-purple-800",
        },
      },
      dark: {
        button: {
          primary:
            "bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 text-purple-900 border-0",
          secondary:
            "bg-gradient-to-r from-cyan-300 to-blue-400 hover:from-cyan-200 hover:to-blue-300 text-cyan-900 border-0",
          outline: "border-purple-400 text-purple-300 hover:bg-purple-950 bg-transparent",
          ghost: "text-purple-400 hover:text-purple-300 hover:bg-purple-950",
        },
        card: {
          base: "border-purple-500 bg-gradient-to-br from-purple-950 to-indigo-950 shadow-lg",
          header: "border-b border-purple-500",
          content: "text-purple-200",
        },
        form: {
          input: "border-purple-500 bg-purple-900 text-purple-100 focus:border-purple-400 focus:ring-purple-400",
          label: "text-purple-300 font-semibold",
          focus: "ring-purple-400",
        },
        alert: {
          base: "border-purple-500 bg-gradient-to-r from-purple-950 to-pink-950",
          text: "text-purple-200",
        },
        badge: {
          base: "bg-gradient-to-r from-purple-800 to-pink-800 text-purple-200 border-purple-500",
          text: "text-purple-200",
        },
      },
    },
  },
  {
    id: "rounded",
    name: "Rounded",
    description: "Soft, friendly design with rounded corners",
    colors: {
      light: {
        primary: "#10b981",
        secondary: "#6b7280",
        accent: "#f59e0b",
        background: "#ffffff",
        foreground: "#065f46",
        muted: "#f0fdf4",
        border: "#d1fae5",
      },
      dark: {
        primary: "#34d399",
        secondary: "#9ca3af",
        accent: "#fbbf24",
        background: "#065f46",
        foreground: "#f0fdf4",
        muted: "#047857",
        border: "#10b981",
      },
    },
    styles: {
      borderRadius: "1.5rem",
      fontWeight: "500",
      spacing: "comfortable",
    },
    components: {
      light: {
        button: {
          primary: "bg-green-500 hover:bg-green-600 text-black border-0 rounded-full",
          secondary: "bg-green-100 hover:bg-green-200 text-green-900 border-0 rounded-full",
          outline: "border-green-300 text-green-700 hover:bg-green-50 bg-transparent rounded-full",
          ghost: "text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full",
        },
        card: {
          base: "border-green-200 bg-white shadow-sm rounded-2xl",
          header: "border-b border-green-100",
          content: "text-green-700",
        },
        form: {
          input: "border-green-300 focus:border-green-500 focus:ring-green-500 rounded-xl bg-white text-green-900",
          label: "text-green-700 font-medium",
          focus: "ring-green-500",
        },
        alert: {
          base: "border-green-200 bg-green-50 rounded-xl",
          text: "text-green-800",
        },
        badge: {
          base: "bg-green-100 text-green-800 border-green-200 rounded-full",
          text: "text-green-800",
        },
      },
      dark: {
        button: {
          primary: "bg-green-400 hover:bg-green-300 text-green-900 border-0 rounded-full",
          secondary: "bg-green-800 hover:bg-green-700 text-green-100 border-0 rounded-full",
          outline: "border-green-400 text-green-300 hover:bg-green-900 bg-transparent rounded-full",
          ghost: "text-green-400 hover:text-green-300 hover:bg-green-900 rounded-full",
        },
        card: {
          base: "border-green-500 bg-green-950 shadow-lg rounded-2xl",
          header: "border-b border-green-500",
          content: "text-green-200",
        },
        form: {
          input: "border-green-500 bg-green-900 text-green-100 focus:border-green-400 focus:ring-green-400 rounded-xl",
          label: "text-green-300 font-medium",
          focus: "ring-green-400",
        },
        alert: {
          base: "border-green-500 bg-green-900 rounded-xl",
          text: "text-green-200",
        },
        badge: {
          base: "bg-green-800 text-green-200 border-green-500 rounded-full",
          text: "text-green-200",
        },
      },
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Sleek dark theme with high contrast",
    colors: {
      light: {
        primary: "#1f2937",
        secondary: "#6b7280",
        accent: "#3b82f6",
        background: "#f9fafb",
        foreground: "#111827",
        muted: "#f3f4f6",
        border: "#d1d5db",
      },
      dark: {
        primary: "#ffffff",
        secondary: "#9ca3af",
        accent: "#60a5fa",
        background: "#111827",
        foreground: "#f9fafb",
        muted: "#1f2937",
        border: "#374151",
      },
    },
    styles: {
      borderRadius: "0.5rem",
      fontWeight: "500",
      spacing: "normal",
    },
    components: {
      light: {
        button: {
          primary: "bg-gray-900 hover:bg-gray-800 text-white border-0",
          secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 border-0",
          outline: "border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent",
          ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        },
        card: {
          base: "border-gray-200 bg-white shadow-sm",
          header: "border-b border-gray-200",
          content: "text-gray-600",
        },
        form: {
          input: "border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-gray-500",
          label: "text-gray-700 font-medium",
          focus: "ring-gray-500",
        },
        alert: {
          base: "border-gray-200 bg-gray-100",
          text: "text-gray-800",
        },
        badge: {
          base: "bg-gray-200 text-gray-800 border-gray-300",
          text: "text-gray-800",
        },
      },
      dark: {
        button: {
          primary: "bg-white hover:bg-gray-100 text-gray-900 border-0",
          secondary: "bg-gray-700 hover:bg-gray-600 text-white border-0",
          outline: "border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent",
          ghost: "text-gray-300 hover:text-white hover:bg-gray-800",
        },
        card: {
          base: "border-gray-700 bg-gray-800 shadow-lg",
          header: "border-b border-gray-700",
          content: "text-gray-300",
        },
        form: {
          input: "border-gray-600 bg-gray-800 text-white focus:border-blue-500 focus:ring-blue-500",
          label: "text-gray-300 font-medium",
          focus: "ring-blue-500",
        },
        alert: {
          base: "border-gray-600 bg-gray-800",
          text: "text-gray-200",
        },
        badge: {
          base: "bg-gray-700 text-gray-200 border-gray-600",
          text: "text-gray-200",
        },
      },
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Electric colors with glowing effects",
    colors: {
      light: {
        primary: "#00ff88",
        secondary: "#ff0080",
        accent: "#00d4ff",
        background: "#f8fafc",
        foreground: "#0a0a0a",
        muted: "#f1f5f9",
        border: "#e2e8f0",
      },
      dark: {
        primary: "#00ff88",
        secondary: "#ff0080",
        accent: "#00d4ff",
        background: "#0a0a0a",
        foreground: "#ffffff",
        muted: "#1a1a1a",
        border: "#333333",
      },
    },
    styles: {
      borderRadius: "0.25rem",
      fontWeight: "700",
      spacing: "tight",
    },
    components: {
      light: {
        button: {
          primary: "bg-green-500 hover:bg-green-400 text-black border-0 shadow-lg shadow-green-500/25",
          secondary: "bg-pink-500 hover:bg-pink-400 text-black border-0 shadow-lg shadow-pink-500/25",
          outline: "border-cyan-500 text-cyan-600 hover:bg-cyan-50 bg-transparent shadow-lg shadow-cyan-500/25",
          ghost: "text-green-600 hover:text-green-500 hover:bg-green-50",
        },
        card: {
          base: "border-gray-200 bg-white shadow-lg shadow-green-500/10",
          header: "border-b border-gray-200",
          content: "text-gray-700",
        },
        form: {
          input: "border-green-300 bg-white text-green-900 focus:border-green-500 focus:ring-green-500",
          label: "text-green-700 font-bold",
          focus: "ring-green-500",
        },
        alert: {
          base: "border-green-300 bg-green-50 shadow-lg shadow-green-500/10",
          text: "text-green-800",
        },
        badge: {
          base: "bg-green-500 text-black border-green-500 shadow-sm shadow-green-500/25",
          text: "text-black",
        },
      },
      dark: {
        button: {
          primary: "bg-green-400 hover:bg-green-300 text-black border-0 shadow-lg shadow-green-400/25",
          secondary: "bg-pink-500 hover:bg-pink-400 text-white border-0 shadow-lg shadow-pink-500/25",
          outline:
            "border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black bg-transparent shadow-lg shadow-cyan-400/25",
          ghost: "text-green-400 hover:text-green-300 hover:bg-green-400/10",
        },
        card: {
          base: "border-gray-700 bg-gray-900 shadow-lg shadow-green-400/10",
          header: "border-b border-gray-700",
          content: "text-gray-200",
        },
        form: {
          input: "border-gray-600 bg-gray-900 text-green-400 focus:border-green-400 focus:ring-green-400",
          label: "text-green-400 font-bold",
          focus: "ring-green-400",
        },
        alert: {
          base: "border-green-400 bg-gray-900 shadow-lg shadow-green-400/10",
          text: "text-green-400",
        },
        badge: {
          base: "bg-green-400 text-black border-green-400 shadow-sm shadow-green-400/25",
          text: "text-black",
        },
      },
    },
  },
]

export function getTheme(themeId: string): Theme | undefined {
  return themes.find((theme) => theme.id === themeId)
}

export function getThemeClasses(
  themeId: string,
  component: ThemeComponentKey,
  variant = "primary",
  mode: ThemeMode = "light",
): string {
  const componentStyles = getTheme(themeId)?.components[mode]?.[component] as
    | Record<string, string>
    | undefined
  return componentStyles?.[variant] ?? ""
}
