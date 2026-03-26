"use client";

import * as React from "react";
import useEmblaCarousel from

"embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";


import { Button } from "@/components/ui/button";






















const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef(



  (
  {
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
  },
  ref) =>
  {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y"
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext
        }}>
        
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}

          role="region"
          aria-roledescription="carousel"
          {...props}>
          
          {children}
        </div>
      </CarouselContext.Provider>);

  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(


  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} style={{ overflow: "hidden" }}>
      <div
          ref={ref}





          {...props} />
        
    </div>);

  });
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(


  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"





        {...props} />);


  });
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(


  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}







        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}>
        
      <ArrowLeft style={{ height: "1rem", width: "1rem" }} />
      <span style={{ position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" }}>Previous slide</span>
    </Button>);

  });
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(


  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}







        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}>
        
      <ArrowRight style={{ height: "1rem", width: "1rem" }} />
      <span style={{ position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" }}>Next slide</span>
    </Button>);

  });
CarouselNext.displayName = "CarouselNext";

export {

  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext };