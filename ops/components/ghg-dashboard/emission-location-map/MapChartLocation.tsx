"use client";
import * as am5 from "@amcharts/amcharts5";
import am5geodata_worldIndiaLow from "@amcharts/amcharts5-geodata/worldIndiaLow";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLayoutEffect, useState } from "react";

export interface MapLocationData {
  name: string;
  address?: any;
  value: number;
  latitude?: number;
  longitude?: number;
}

export interface Props {
  mapLocationData: MapLocationData[];
}

const MapChartLocation: React.FC<Props> = ({ mapLocationData }) => {
  const chartID = `chartDiv`;
  const [geocodedData, setGeocodedData] = useState<MapLocationData[]>([]);

  useLayoutEffect(() => {
    const fetchData = async () => {
      try {
        const geocodedAddresses = mapLocationData.map((item) => {
          return {
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            value: item.value,
          };
        });

        setGeocodedData(geocodedAddresses);
      } catch (error) {
        console.error("Error processing geocoded data:", error);
      }
    };
    fetchData();
  }, [chartID, mapLocationData]);

  // Calculate the average latitude and longitude of data points
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;
  let minLongitude = Infinity;
  let maxLongitude = -Infinity;

  // Iterate through data points to find the bounding box
  for (const { latitude, longitude } of geocodedData) {
    minLatitude = Math.min(minLatitude, latitude ?? 0);
    maxLatitude = Math.max(maxLatitude, latitude ?? 0);
    minLongitude = Math.min(minLongitude, longitude ?? 0);
    maxLongitude = Math.max(maxLongitude, longitude ?? 0);
  }

  // Calculate the center of the bounding box
  const centerLongitude = (maxLongitude + minLongitude) / 2;
  const centerLatitude = (maxLatitude + minLatitude) / 2;

  // Calculate the zoom level based on the bounding box dimensions
  const zoomLevel = Math.min(
    Math.log2(360 / Math.abs(maxLongitude - minLongitude)),
    Math.log2(180 / Math.abs(maxLatitude - minLatitude))
  );
  useLayoutEffect(() => {
    if (geocodedData.length > 0) {
      const root = am5.Root.new(chartID);
      root._logo?.dispose();
      root.setThemes([am5themes_Animated.new(root)]);
      let chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: "rotateX",
          panY: "none",
          wheelY: "none",
          projection: am5map.geoMercator(),
          homeZoomLevel: zoomLevel * 2,
          // rotationX: -80,
          homeGeoPoint: {
            longitude: centerLongitude,
            latitude: centerLatitude,
          },
        })
      );

      chart.events.on("wheel", function (ev) {
        if (ev.originalEvent.ctrlKey) {
          ev.originalEvent.preventDefault();
          chart.set("wheelY", "zoom");
        } else {
          chart.set("wheelY", "none");
        }
      });

      var polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          // geoJSON: am5geodata_worldLow,
          geoJSON: am5geodata_worldIndiaLow,
          exclude: ["AQ"],
        })
      );
      polygonSeries.events.on("datavalidated", function () {
        chart.goHome();
      });
      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        templateField: "polygonSettings",
        fill: am5.color("#cccccc"),
      });
      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color("#aaa"),
      });
      const series = chart.series.push(am5map.MapPointSeries.new(root, {}));

      series.data.setAll(
        geocodedData.map(({ latitude, longitude, name, value }) => ({
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
            name: name,
            value: value,
          },
        }))
      );
      let max = -Infinity;
      let min = Infinity;
      series.data.each((dataItem: any) => {
        const value = dataItem.geometry.value;
        if (!isNaN(value)) {
          max = Math.max(max, value);
          min = Math.min(min, value);
        } else {
          console.error("Invalid value:", value);
        }
      });
      // Define constants for minRadius and maxRadius
      const minRadius = 5; // Minimum radius
      const maxRadius = 15; // Maximum radius

      // Define a scaling function to map the value range to the radius range
      const scaleValueToRadius = (value: number) => {
        const min = Math.min(...geocodedData.map(({ value }) => value));
        const max = Math.max(...geocodedData.map(({ value }) => value));
        const denominator = geocodedData.length > 1 ? max - min : min;
        return (
          minRadius + ((value - min) * (maxRadius - minRadius)) / denominator
        );
      };

      // Sort data array based on value
      const sortedData = geocodedData.sort((a, b) => b.value - a.value);
      // Define an array of colors for bullets
      const bulletColors = ["#FF9907", "#616161", "#979797", "#ADADAD"];
      // Add bullets with dynamically determined color and radius
      series.bullets.push(function (root, series, dataItem: any) {
        const value = dataItem.dataContext.geometry.value;
        const name = dataItem.dataContext.geometry.name;
        let bulletColor;

        if (bulletColors.length >= geocodedData.length) {
          const index = sortedData.findIndex((item) => item.value === value);
          bulletColor = bulletColors[index % bulletColors.length];
        } else {
          const lastIndex = bulletColors.length - 1;
          const index = geocodedData.findIndex((item) => item.value === value);
          bulletColor =
            index < lastIndex ? bulletColors[index] : bulletColors[lastIndex];
        }

        const radius = scaleValueToRadius(value);
        const hoverValue = `${name} \n${value} tco2e`;
        const bullet = am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: radius,
            fill: am5.color(bulletColor),
            stroke: am5.color(0xffffff),
            strokeWidth: 2,
            tooltipText: hoverValue,
            showTooltipOn: "hover",
          }),
        });
        return bullet;
      });

      let zoomControl = chart.set(
        "zoomControl",
        am5map.ZoomControl.new(root, {})
      );

      [zoomControl.minusButton, zoomControl.plusButton].forEach(
        (button: any) => {
          button.get("background").setAll({
            fill: am5.color(0x979797),
            fillOpacity: 0.5,
          });
          button
            .get("background")
            .states.create("hover", {})
            .setAll({
              fill: am5.color(0x979797),
              fillOpacity: 0.7,
            });

          button
            .get("background")
            .states.create("down", {})
            .setAll({
              fill: am5.color(0x979797),
              fillOpacity: 1,
            });
        }
      );

      return () => {
        root.dispose();
      };
    }
  }, [chartID, geocodedData, centerLongitude, centerLatitude, zoomLevel]);

  return <div id={chartID} style={{ width: "100%", height: "500px" }} />;
};

export default MapChartLocation;
