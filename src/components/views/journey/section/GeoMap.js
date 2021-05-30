import { Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import React, { useEffect, useRef, useState } from 'react';
import Point from 'ol/geom/Point';

const GeoMap = ({ addLayers }) => {
  const [map, setMap] = useState();

  const mapElement = useRef();
  const mapRef = useRef();

  mapRef.current = map;

  useEffect(() => {
    const pnt = new Point([126.972, 37.5293]).transform(
      'EPSG:4326',
      'EPSG:3857'
    );
    const changePoints = pnt.getCoordinates();
    const initialFeaturesLayer = new VectorLayer({
      source: new VectorSource()
    });

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: `https://mt1.google.com/vt/lyrs=m@113&hl=en&&x={x}&y={y}&z={z}`
          })
        }),
        initialFeaturesLayer
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: changePoints,
        zoom: 12
      }),
      controls: []
    });

    initialMap.on('click', handleMapClick);
    setMap(initialMap);
  }, []);

  useEffect(() => {
    async function fetchApi() {
      const initLayers = map.getLayers().array_;

      for (let i = 0; i < initLayers.length; i += 1) {
        if (['ImageWMS', 'tempLayer'].includes(initLayers[i].get('name'))) {
          map.removeLayer(initLayers[i]);
          i -= 1;
        }
      }
      // console.log('geomap:', initLayers, addLayers);
      if (addLayers?.length) {
        let [minX, minY, maxX, maxY] = map
          .getView()
          .calculateExtent(map.getSize());
        const res = map.getView().getResolution();
        for (let i = 0; i < addLayers?.length; i += 1) {
          addLayers[i] && map.addLayer(addLayers[i]);

          if (addLayers[i].get('name') !== 'ImageWMS') {
            minX = Math.min(addLayers[i].getSource().getExtent()[0], minX);
            minY = Math.min(addLayers[i].getSource().getExtent()[1], minY);
            maxX = Math.max(addLayers[i].getSource().getExtent()[2], maxX);
            maxY = Math.max(addLayers[i].getSource().getExtent()[3], maxY);
          }
        }
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        let extention = [minX, minY, maxX, maxY];
        // console.log('extention', extention, [centerX, centerY]);
        map.setView(
          new View({
            center: [centerX, centerY]
          })
        );
        map.getView().fit(extention, {
          constrainResolution: false,
          padding: [50, 50, 50, 50],
          minResolution: 10
        });
        map.getView().setResolution(res);
      }
      map.render();
    }

    if (!map) return;
    fetchApi();
  }, [addLayers, map]);

  const handleMapClick = (e) => {
    const features = mapRef.current.getFeaturesAtPixel(e.pixel);
    if (!features) return;
    console.log('e:', e.pixel, features, features[0]?.get('layer_id'));
    // feature layer_id uuid type
  };

  return (
    <>
      <div ref={mapElement} className="map-container"></div>
    </>
  );
};

export default GeoMap;
