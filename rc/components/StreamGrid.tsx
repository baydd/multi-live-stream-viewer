const handleLayoutChange = (layout: Layout[]) => {
  if (!layout.length) return;
  // Son yapılan boyutlandırmayı bul (veya ilk kutunun boyutunu referans al)
  const ref = layout[layout.length - 1];
  const updatedStreams = streams.map((stream, idx) => ({
    ...stream,
    layout: {
      ...stream.layout,
      w: ref.w,
      h: ref.h,
      x: idx % cols,
      y: Math.floor(idx / cols),
    },
  }));
  onUpdateStreams(updatedStreams);
}; 