import { useJsApiLoader } from "@react-google-maps/api";
import { createContext, useCallback, useState } from "react";

// Contexto para compartilhar o mapa e estado de carregamento
export const MapCreatedContext = createContext({
  map: null,
  onLoad: null,
  onUnmount: null,
  isLoaded: false,
});

export const MapContext = ({ children }) => {
  const [libraries] = useState(["geometry"]);

  // Use a variável de ambiente do Vite
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);

    mapInstance.addListener("zoom_changed", () => {
      localStorage.setItem("zoom", mapInstance.getZoom());
    });

    mapInstance.addListener("center_changed", () => {
      const center = mapInstance.getCenter();
      localStorage.setItem(
        "center",
        JSON.stringify({ lat: center.lat(), lng: center.lng() })
      );
    });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) return <div>Erro ao carregar o mapa</div>;

  return (
    <MapCreatedContext.Provider value={{ map, onLoad, onUnmount, isLoaded }}>
      {children} {/* Sempre renderiza os filhos */}
      {isLoaded && (
        <div style={{ height: "400px", width: "100%" }}>
          {/* Exemplo de mapa para teste */}
        </div>
      )}
    </MapCreatedContext.Provider>
  );
};
