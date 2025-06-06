"use client";

import React, { UIEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { PDFFile } from "@/lib/types";
import { pdfjs } from "react-pdf";
import dynamic from "next/dynamic";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Dynamically import PDF components to avoid SSR issues
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });
const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });

// Initialize PDF.js worker
if(typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc){
  pdfjs.GlobalWorkerOptions.workerSrc = "./pdf.worker.mjs";
}

const options = {};
const resizeObserverOptions = {};
const maxWidth = 800;

/**
 * PDFViewer Component
 * A responsive PDF viewer with dynamic page loading and scroll synchronization
 */
export default function PDFViewer(
  { 
    pdf,                // PDF file to display
    setIsRendered,     // Callback when PDF is fully rendered
    type,              // PDF type (e.g., 'pptx' for special handling)
    onScroll,          // Scroll synchronization callback
    scrollRef          // Ref for scroll synchronization
  }: { 
    pdf: PDFFile; 
    setIsRendered?: (b: boolean) => void; 
    type?: string; 
    onScroll?: UIEventHandler<HTMLDivElement>; 
    scrollRef?: React.RefObject<HTMLDivElement>;
  }
) {
  // State management
  const [file, setFile] = useState<PDFFile>(pdf);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(maxWidth);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);

  // Refs for cleanup and observation
  const pdfDocumentRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const genericRef = useRef<HTMLDivElement | null>(null);
  const firstPageRef = useRef<HTMLCanvasElement | null>(null);

  // Use provided scroll ref or fallback to generic ref
  const containerRef = scrollRef ?? genericRef;

  /**
   * Handle container resize
   */
  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      const width = Math.min(entry.contentRect.width, maxWidth);
      setPageWidth(width);
    }
  }, []);

  useResizeObserver(containerRef.current, resizeObserverOptions, onResize);

  /**
   * Calculate and update page height based on file type and dimensions
   */
  const updatePageHeight = useCallback(() => {
    if (firstPageRef.current) {
      let fileWidth = 210;  // Default A4 width in mm
      let fileHeight = 297; // Default A4 height in mm

      // Adjust dimensions for PowerPoint files
      if (type === 'pptx' || (file instanceof File && file.name.endsWith('.pptx'))) {
        fileWidth = 254;   // 10 inches in mm
        fileHeight = 190.5;
      }

      const scale = fileHeight / fileWidth;
      const expectedHeight = pageWidth * scale;
      setPageHeight(expectedHeight);
    }
  }, [pageWidth, file, type]);

  /**
   * Cleanup PDF resources and reset state
   */
  const cleanupPDF = useCallback(() => {
    if (pdfDocumentRef.current) {
      void pdfDocumentRef.current.destroy();
      pdfDocumentRef.current = null;
    }
    setNumPages(0);
    setVisiblePages([]);
    if (setIsRendered) setIsRendered(false);
  }, [setIsRendered]);

  // Update file when prop changes
  useEffect(() => {
    setFile(pdf);
    cleanupPDF();
    if (setIsRendered) {
      setIsRendered(false);
    }
  }, [pdf, cleanupPDF, setIsRendered]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupPDF();
    };
  }, [cleanupPDF]);

  /**
   * Handle successful PDF document load
   */
  function onDocumentLoadSuccess(pdfDoc: pdfjs.PDFDocumentProxy): void {
    if (!mountedRef.current) return;
    
    pdfDocumentRef.current = pdfDoc;
    setNumPages(pdfDoc.numPages);
    updatePageHeight();
    
    // Delay setting rendered state to ensure smooth transition
    timerRef.current = setTimeout(() => {
      if (mountedRef.current && setIsRendered) {
        setIsRendered(true);
      }
    }, 500);
  }

  // Setup intersection observer for page visibility
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const pageNumber = parseInt(entry.target.getAttribute("data-page-number") ?? "0", 10);
        if (entry.isIntersecting) {
          setVisiblePages((prev) => [...prev, pageNumber]);
        } else {
          setVisiblePages((prev) => prev.filter((p) => p !== pageNumber));
        }
      });
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div 
      className="flex size-full items-start justify-center overflow-auto" 
      ref={containerRef} 
      onScroll={onScroll}
      style={{ maxHeight: '100%', height: '100%' }}
    >
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={cleanupPDF}
        options={options}
        className="flex flex-col space-y-4 w-full"
        loading={null}
      >
        {/* Render pages */}
        {Array.from(new Array(numPages), (el, index) => (
          <div
            key={`page_${index + 1}`}
            className="relative shadow-lg mx-auto"
            style={{ 
              height: pageHeight, 
              width: pageWidth,
              minHeight: pageHeight
            }}
            data-page-number={index + 1}
            ref={(el) => {
              if (el && observerRef.current) {
                observerRef.current.observe(el);
              }
            }}
          >
            {/* Only render pages that are visible */}
            {visiblePages.includes(index + 1) && (
              <Page
                canvasRef={index === 0 ? firstPageRef : undefined}
                pageNumber={index + 1}
                width={pageWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                onLoadSuccess={index === 0 ? updatePageHeight : undefined}
                loading={null}
              />
            )}
          </div>
        ))}
      </Document>
    </div>
  );
}