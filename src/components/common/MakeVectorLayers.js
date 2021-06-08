import GeoJSON from 'ol/format/GeoJSON';
import { ImageWMS, Vector } from 'ol/source';
import { Stroke, Style, Fill, Circle } from 'ol/style';
import axios from 'axios';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer';
import { config } from '../../config';
import { View } from 'ol';
import { transformExtent } from 'ol/proj';

/**
 *
 * @param {*} uuid - 각 mission, draft, recorded의 uuid
 * @param {*} layerType - mission/draft,recored
 * @param {*} name - ImageWMS(wms)/tempLayer(vector)
 * @param {*} lineColor - styles
 * @param {*} lineWidth - styles
 * @param {*} isVisible - styles
 * @param {*} geoType - point/line/polygon
 * @param {*} key - projectId/JourneyId
 * @param {*} fileName - geojson file name
 * @returns
 */
export const getImageWMS = async (
  uuid,
  layerType,
  name,
  lineColor,
  lineWidth,
  isVisible,
  geoType,
  key,
  fileName
) => {
  let typedSld = '';

  switch (geoType) {
    case 'MultiPoint':
    case 'Point':
      typedSld = `<PointSymbolizer><Graphic><Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">${lineColor}</CssParameter></Fill></Mark><Size>${6}</Size></Graphic><VendorOption name="labelObstacle">false</VendorOption></PointSymbolizer>`;
      break;
    case 'MultiLineString':
    case 'LineString':
      typedSld = `<LineSymbolizer><Stroke><CssParameter name="stroke">${lineColor}</CssParameter><CssParameter name="stroke-width">${lineWidth}</CssParameter></Stroke></LineSymbolizer>`;
      break;
    case 'MultiPolygon':
    case 'Polygon':
      typedSld = `<PolygonSymbolizer><Fill><CssParameter name="fill">${lineColor}</CssParameter><CssParameter name="fill-opacity">0.0</CssParameter></Fill><Stroke><CssParameter name="stroke">${lineColor}</CssParameter><CssParameter name="stroke-width">${lineWidth}</CssParameter></Stroke></PolygonSymbolizer>`;
      break;
    default:
      break;
  }
  const sld = `<?xml version="1.0" encoding="ISO-8859-1"?><StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><NamedLayer><Name>poclacorr:${layerType}</Name><UserStyle><Title>A transparent style</Title><FeatureTypeStyle><Rule>${typedSld}</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;

  const wmsSource = new ImageWMS({
    url: `${config.geoserver}/wms`,
    params: {
      TRANSPARENT: true,
      TILED: true,
      CQL_FILTER: `uuid='${uuid}'`
    },
    ratio: 1,
    serverType: 'geoserver',
    crossOrigin: 'anonymous'
  });

  wmsSource.updateParams({ STYLES: undefined, SLD_BODY: sld });

  const wmsLayer = new ImageLayer({
    source: wmsSource,
    name: name,
    type: layerType,
    key,
    uuid,
    fileName
  });

  // set zIndex
  const zIndex = 100;
  let zLevel = 100;

  switch (layerType) {
    case 'draft':
      zLevel = zIndex;
      break;
    case 'mission':
      zLevel = zIndex + 1;
      break;
    case 'recorded':
      if (fileName.includes('markPos')) {
        zLevel = zIndex + 3;
      } else {
        zLevel = zIndex + 2;
      }
      break;
  }

  wmsLayer.setZIndex(zLevel);
  wmsLayer.setVisible(isVisible);
  return wmsLayer;
};

export const getGeoJSONFromGeoSever = async (layerId, layerType) => {
  const url = `${config.geoserver}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=poclacorr%3A${layerType}&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=layer_id=%27${layerId}%27`;

  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors'
  });

  const json = await res.json();
  if (json.numberMatched > 1000) return [];
  return json;
};

export const getGeoJSONfromFile = async (file) => {
  const formData = new FormData();

  formData.append('file[]', file);

  const json = await axios
    .post(
      `${config.twr_api}/api/worker/contents/journey/one/plan/getgeojson`,
      formData,
      {
        header: { 'content-type': 'multipart/form-data' }
      }
    )
    .then((res) => {
      if (res.data[0].geoJSON) return res.data[0].geoJSON;
    })
    .catch((err) => {
      return err.toJSON();
    });

  if (json.numberMatched > 1000) return [];

  return json;
};

export const changeStyle = (layer, styleOptions) => {
  const { lineColor, lineWidth, isEnabled } = styleOptions;
  const fill = new Fill({
    color: 'rgba(210, 122, 167,0.1)'
  });
  const stroke = new Stroke({
    color: lineColor,
    width: lineWidth
  });

  const styles = [
    new Style({
      fill: fill,
      stroke: stroke,
      image: new Circle({
        radius: lineWidth,
        fill: new Fill({
          color: lineColor
        })
      })
    })
  ];

  layer.setStyle(styles);
  layer.setVisible(isEnabled);

  return layer;
};

export const MakeVectorLayers = async (data, name, styleOptions) => {
  const features = new GeoJSON().readFeatures(data, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
  const geoSource = new Vector({
    features: features
  });

  const geoVectorLayer = new VectorLayer({
    source: geoSource,
    name: name
  });

  const options = styleOptions
    ? styleOptions
    : {
        lineColor: '#ff0000',
        lineWidth: 1,
        isEnabled: true
      };
  const styledLayer = changeStyle(geoVectorLayer, options);

  return styledLayer;
};

// get Bbox from geoserver
export const getFeatureInfoFromGeoSever = async (options) => {
  const { name, value, type } = options;
  const url = `${config.geoserver}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=poclacorr%3A${type}&maxFeatures=50&outputFormat=application%2Fjson&cql_filter=${name}=%27${value}%27`;

  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors'
  });

  const json = await res.json();
  const { bbox } = json;

  if (!bbox) return;
  const bbox3857 = transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
  return bbox3857;
};

const getCenterOfExtent = (Extent) => {
  if (!Extent) return;
  var X = Extent[0] + (Extent[2] - Extent[0]) / 2;
  var Y = Extent[1] + (Extent[3] - Extent[1]) / 2;
  return [X, Y];
};

export const setZoomOnMap = (bbox, map) => {
  if (!bbox) return;
  if (!map) return;

  const centerCoordinate = getCenterOfExtent(bbox);

  map.setView(
    new View({
      center: centerCoordinate,
      zoom: map.getView().getZoom(),
      minZoom: 6,
      maxZoom: 19
    })
  );

  map.getView().fit(bbox, {
    constrainResolution: false,
    padding: [100, 100, 100, 100]
    // minResolution: 10
  });
};

export default MakeVectorLayers;
