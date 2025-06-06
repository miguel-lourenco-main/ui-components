'use client'

import { Trans } from './trans'

/**
 * I18nComponent
 * A wrapper component for internationalization (i18n) text rendering
 * 
 * Features:
 * - Translates text using i18n keys
 * - Supports optional styling through className
 * - Uses the Trans component for translation handling
 * 
 * @param i18nKey - The translation key to look up
 * @param className - Optional CSS classes to apply to the translated text
 */
export default function I18nComponent({
    i18nKey,
    className
}: {
    i18nKey: string      // The key to look up in the translation files
    className?: string   // Optional CSS classes for styling
}) {
  // Render the translated text using the Trans component
  
  return <Trans i18nKey={i18nKey} className={className}/>
}