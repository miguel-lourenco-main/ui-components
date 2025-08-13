"use client"

import { notFound } from 'next/navigation'
import ImprovedDynamicComponent from '@/components/improved-dynamic-component'
import { COMPONENTS_INDEX } from '@/lib/componentsIndex'
import indexJson from '@/components/display-components/index.json'

interface PageProps { params: { componentId: string } }

export default function ComponentPage({ params }: PageProps) {
  const id = params.componentId?.toLowerCase()
  if (!id) {
    notFound()
  }
  
  // Check if component exists in registry
  const blacklist = (indexJson.blacklist || []) as string[];
  const component = COMPONENTS_INDEX.find(c => c.id.toLowerCase() === id || c.name.toLowerCase() === id);
  
  if (!component || blacklist.includes(component.id)) {
    notFound()
  }
  
  return <ImprovedDynamicComponent componentId={component.id} />
}



