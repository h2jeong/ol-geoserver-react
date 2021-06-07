import { Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import React, { useEffect, useRef, useState } from 'react';
import Point from 'ol/geom/Point';
import { extend } from 'ol/extent';
import { shallowEqual, useSelector } from 'react-redux';
import { getFeatureInfoFromGeoSever, setZoomOnMap } from './MakeVectorLayers';

const GeoMap = ({ addLayers, focus }) => {
  const project = useSelector(
    ({ project }) => ({ current: project.current }),
    shallowEqual
  );
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
      console.log('geomap:', initLayers, addLayers);
      if (addLayers?.length > 0) {
        for (let i = 0; i < addLayers.length; i += 1) {
          if (addLayers[i]) {
            map.addLayer(addLayers[i]);
          }
        }
      }
      setCurrentZoom();
    }
    if (!map) return;
    fetchApi();
  }, [addLayers, map]);

  useEffect(() => {
    if (!focus) return;
    setCurrentZoom(focus);
  }, [focus]);

  const setCurrentZoom = async (focus) => {
    let featExtent;
    let options = {};
    let firstRecorded;
    let firstMission;
    let firstDraft;
    let tempLayers;

    if (focus) {
      const { records, missions, projectId } = focus;
      firstRecorded = records?.find((item) => item.isEnabled);
      firstMission = missions?.find((item) => item.isEnabled);
      if (firstRecorded) {
        options = {
          name: 'layer_id',
          value: firstRecorded.id,
          type: 'recorded'
        };
        const extentSecond = await getFeatureInfoFromGeoSever(options);
        if (extentSecond) {
          if (featExtent) {
            featExtent = extend(featExtent, extentSecond);
          } else {
            featExtent = extentSecond;
          }
        }
      } else {
        if (firstMission) {
          options = {
            name: 'layer_id',
            value: firstMission.id,
            type: 'mission'
          };
          const extentSecond = await getFeatureInfoFromGeoSever(options);
          if (extentSecond) {
            if (featExtent) {
              featExtent = extend(featExtent, extentSecond);
            } else {
              featExtent = extentSecond;
            }
          }
        } else {
          if (projectId) {
            options = {
              name: 'project_id',
              value: projectId,
              type: 'draft'
            };
            const extentSecond = await getFeatureInfoFromGeoSever(options);
            if (extentSecond) {
              if (featExtent) {
                featExtent = extend(featExtent, extentSecond);
              } else {
                featExtent = extentSecond;
              }
            }
          }
        }
      }
    }

    if (!['all', 'none'].includes(project.current)) {
      if (!focus) {
        firstDraft = addLayers.find(
          (item) => item.get('type') === 'draft' && item.get('visible')
        );
        firstRecorded = addLayers.find(
          (item) => item.get('type') === 'recorded' && item.get('visible')
        );
        firstMission = addLayers.find(
          (item) => item.get('type') === 'mission' && item.get('visible')
        );

        tempLayers = addLayers.filter(
          (item) => item.get('name') === 'tempLayer' && item.get('visible')
        );

        if (firstDraft) {
          options = {
            name: 'project_id',
            value: firstDraft.get('key'),
            type: firstDraft.get('type')
          };
          featExtent = await getFeatureInfoFromGeoSever(options);
        }
        if (tempLayers?.length > 0) {
          if (!featExtent) {
            featExtent = addLayers[0]?.getSource().getExtent();
          }
          for (let i = 0; i < tempLayers.length; i += 1) {
            featExtent = extend(
              featExtent,
              tempLayers[i].getSource().getExtent()
            );
          }
        }

        if (firstRecorded) {
          options = {
            name: 'uuid',
            value: firstRecorded.get('uuid'),
            type: firstRecorded.get('type')
          };
          const extentSecond = await getFeatureInfoFromGeoSever(options);
          if (extentSecond) {
            if (featExtent) {
              featExtent = extend(featExtent, extentSecond);
            } else {
              featExtent = extentSecond;
            }
          }
        } else {
          if (firstMission) {
            options = {
              name: 'uuid',
              value: firstMission.get('uuid'),
              type: firstMission.get('type')
            };
            const extentSecond = await getFeatureInfoFromGeoSever(options);

            if (extentSecond) {
              if (featExtent) {
                featExtent = extend(featExtent, extentSecond);
              } else {
                featExtent = extentSecond;
              }
            }
          }
        }
      }
    }
    setTimeout(() => {
      if (!featExtent) {
        featExtent = map?.getView().calculateExtent(map?.getSize());
      }

      setZoomOnMap(featExtent, map);
    }, 100);
  };

  return (
    <>
      <div ref={mapElement} className="map-container"></div>
    </>
  );
};

export default GeoMap;
