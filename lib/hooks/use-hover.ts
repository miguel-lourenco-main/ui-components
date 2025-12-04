/**
 * Custom React hook to detect hover state on an HTML element.
 *
 * @returns {{ref: React.RefObject<any>, isHovered: boolean}} Object containing the ref to attach to the element and the hover state boolean.
 */
function useHover() {
  const [isHovered, setIsHovered] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return {ref, isHovered};
}

export default useHover;
