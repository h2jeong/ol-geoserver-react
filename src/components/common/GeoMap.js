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

/**
 * initial map, initial TileLayer, VectorLayer
 */
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

  /**
   * addLayer on map & set focus, zoom
   */
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

  /**
   * 지도 그릴때 Extent 계산하기
   * @param {*} focus 선택된 Layer가 있을 경우 recorded>mission>drafts 순으로
   * 없을 경우 project draft>temp>recorded>mission
   */
  const setCurrentZoom = async (focus) => {
    let featExtent;
    let options = {};

    if (focus) {
      const { records, missions, projectId } = focus;
      const filterRecorded = records?.filter((item) => item.isEnabled);
      const filterMission = missions?.filter((item) => item.isEnabled);

      if (filterRecorded && filterRecorded.length > 0) {
        for (let i = 0; i < filterRecorded.length; i += 1) {
          options = {
            name: 'layer_id',
            value: filterRecorded[i].id,
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
        }
      } else {
        if (filterMission && filterMission.length > 0) {
          for (let i = 0; i < filterMission.length; i += 1) {
            options = {
              name: 'layer_id',
              value: filterMission[i].id,
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
        const firstDraft = addLayers.find(
          (item) => item.get('type') === 'draft' && item.get('visible')
        );
        const firstRecorded = addLayers.find(
          (item) => item.get('type') === 'recorded' && item.get('visible')
        );
        const firstMission = addLayers.find(
          (item) => item.get('type') === 'mission' && item.get('visible')
        );

        const tempLayers = addLayers.filter(
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
