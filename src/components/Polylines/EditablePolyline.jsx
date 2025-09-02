import React, { useCallback, useRef, useState } from "react";
import { Polyline, InfoWindow } from "@react-google-maps/api";
import useEditablePolyline from "../../hooks/useEditablePolyline";
import useMap from "../../hooks/useMap";

/**
 * EditablePolyline melhorado:
 * - glow (segunda polyline por baixo)
 * - hover effects (peso + cor)
 * - info window mostrando comprimento enquanto hover/arrasta
 * - limpeza correta de listeners
 */
const EditablePolyline = () => {
  const { map } = useMap();
  const { coordinates, setCoordinates, polylineRef } = useEditablePolyline();

  // listeners vinculados ao path (para editar)
  const listenersRef = useRef([]);

  // hover state para efeitos visuais e tooltip
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState(null); // { lat, lng } para InfoWindow
  const [currentLength, setCurrentLength] = useState(null);

  // cores / estilo (pode puxar do seu theme)
  const baseColor = "#313552"; // cor padrão
  const highlightColor = "#0d6efd"; // cor de destaque ao hover

  const computeLengthMeters = useCallback((coords) => {
    if (!window.google?.maps?.geometry?.spherical) return 0;
    try {
      const latLngs = coords.map((c) => new window.google.maps.LatLng(c.lat, c.lng));
      const meters = window.google.maps.geometry.spherical.computeLength(latLngs);
      return meters;
    } catch (err) {
      return 0;
    }
  }, []);

  // atualiza o comprimento sempre que as coordinates mudam
  React.useEffect(() => {
    if (!coordinates || coordinates.length === 0) {
      setCurrentLength(null);
      return;
    }
    const meters = computeLengthMeters(coordinates);
    setCurrentLength(meters);
  }, [coordinates, computeLengthMeters]);

  // usado quando o usuário edita -> atualiza state com nova path
  const onEdit = useCallback(() => {
    if (polylineRef?.current) {
      const nextPath = polylineRef.current
        .getPath()
        .getArray()
        .map((latLng) => latLng.toJSON());
      setCoordinates(nextPath);
      const meters = computeLengthMeters(nextPath);
      setCurrentLength(meters);
    }
  }, [setCoordinates, polylineRef, computeLengthMeters]);

  const onLoadHandler = useCallback(
    (polyline) => {
      // mantém a referência da polyline para manipulação
      polylineRef.current = polyline;

      // vincula listeners no path para detectar edição
      const path = polyline.getPath();
      // limpa antigos listeners (evita acumular)
      listenersRef.current.forEach((l) => l.remove());
      listenersRef.current = [
        path.addListener("set_at", onEdit),
        path.addListener("insert_at", onEdit),
        path.addListener("remove_at", onEdit),
      ];
    },
    [onEdit, polylineRef]
  );

  const onUnmount = useCallback(() => {
    // remove listeners
    listenersRef.current.forEach((lis) => {
      try {
        lis.remove();
      } catch (e) {}
    });
    listenersRef.current = [];
    polylineRef.current = null;
  }, [polylineRef]);

  // remover vértice com clique direito (mantive sua lógica)
  const deleteVertexHandler = useCallback(
    (event) => {
      if (event.vertex !== undefined && polylineRef.current) {
        const path = polylineRef.current.getPath();
        path.removeAt(event.vertex);
        onEdit();
      }
    },
    [onEdit, polylineRef]
  );

  // hover handlers: atualiza posição do mouse e estado
  const handleMouseOver = useCallback((e) => {
    setIsHovering(true);
    const latLng = e.latLng?.toJSON ? e.latLng.toJSON() : null;
    setMousePos(latLng);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const latLng = e.latLng?.toJSON ? e.latLng.toJSON() : null;
    setMousePos(latLng);
  }, []);

  const handleMouseOut = useCallback(() => {
    setIsHovering(false);
    setMousePos(null);
  }, []);

  // opções das polylines:
  // glow: grande, opaco baixo
  const glowOptions = {
    clickable: false,
    draggable: false,
    editable: false,
    strokeColor: highlightColor,
    strokeOpacity: 0.12,
    strokeWeight: 12,
    zIndex: 1,
  };

  // linha principal que responde ao hover
  const mainOptions = {
    clickable: true,
    draggable: true,
    editable: true,
    strokeColor: isHovering ? highlightColor : baseColor,
    strokeOpacity: 1.0,
    strokeWeight: isHovering ? 5 : 3,
    zIndex: 2,
  };

  // formatador de comprimento (m -> m ou km)
  const formatLength = (meters) => {
    if (meters == null) return "";
    if (meters < 1000) return `${meters.toFixed(1)} m`;
    return `${(meters / 1000).toFixed(3)} km`;
  };

  // só renderiza se o mapa estiver pronto e existirem coords
  if (!map || !coordinates || coordinates.length === 0) return null;

  return (
    <>
      {/* Glow (linha por baixo) */}
      <Polyline
        path={coordinates}
        options={glowOptions}
        // Não precisa de onLoad para a glow
      />

      {/* Linha editável principal */}
      <Polyline
        path={coordinates}
        options={mainOptions}
        onLoad={onLoadHandler}
        onUnmount={onUnmount}
        onRightClick={deleteVertexHandler}
        onMouseOver={handleMouseOver}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
        onMouseUp={onEdit} // ao soltar o mouse atualiza coords
      />

      {/* InfoWindow com comprimento enquanto hover */}
      {isHovering && mousePos && (
        <InfoWindow position={mousePos}>
          <div style={{ padding: 6, fontSize: 13, fontWeight: 600 }}>
            {formatLength(currentLength)}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default EditablePolyline;
