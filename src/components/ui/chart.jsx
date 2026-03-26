"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";



// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" };















const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef(







  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
      <div
          data-chart={chartId}
          ref={ref}




          {...props}>
          
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>);

  });
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES).
        map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.
          map(([key, itemConfig]) => {
            const color =
            itemConfig.theme?.[theme] ||
            itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).
          join("\n")}
}
`
        ).
        join("\n")
      }} />);


};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef(










  (
  {
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey
  },
  ref) =>
  {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
      !labelKey && typeof label === "string" ?
      config[label]?.label || label :
      itemConfig?.label;

      if (labelFormatter) {
        return (
          <div>
            {labelFormatter(value, payload)}
          </div>);

      }

      if (!value) {
        return null;
      }

      return <div>{value}</div>;
    }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey]
    );

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}>



        
        
        {!nestLabel ? tooltipLabel : null}
        <div style={{ display: "grid", gap: "0.375rem" }}>
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div
                key={item.dataKey}>



                
                
                {formatter && item?.value !== undefined && item.name ?
                formatter(item.value, item.name, item, index, item.payload) :

                <>
                    {itemConfig?.icon ?
                  <itemConfig.icon /> :

                  !hideIndicator &&
                  <div










                    style={
                    {
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor
                    }
                    } />


                  }
                    <div>



                    
                    
                      <div style={{ display: "grid", gap: "0.375rem" }}>
                        {nestLabel ? tooltipLabel : null}
                        <span>
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value &&
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>
                          {item.value.toLocaleString()}
                        </span>
                    }
                    </div>
                  </>
                }
              </div>);

          })}
        </div>
      </div>);

  }
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef(







  (
  { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
  ref) =>
  {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}>




        
        
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}>


              
              
              {itemConfig?.icon && !hideIcon ?
              <itemConfig.icon /> :

              <div

                style={{ height: "0.5rem", width: "0.5rem", flexShrink: "0", borderRadius: "2px",
                  backgroundColor: item.color
                }} />

              }
              {itemConfig?.label}
            </div>);

        })}
      </div>);

  }
);
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
config,
payload,
key)
{
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
  "payload" in payload &&
  typeof payload.payload === "object" &&
  payload.payload !== null ?
  payload.payload :
  undefined;

  let configLabelKey = key;

  if (
  key in payload &&
  typeof payload[key] === "string")
  {
    configLabelKey = payload[key];
  } else if (
  payloadPayload &&
  key in payloadPayload &&
  typeof payloadPayload[key] === "string")
  {
    configLabelKey = payloadPayload[
    key];

  }

  return configLabelKey in config ?
  config[configLabelKey] :
  config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle };