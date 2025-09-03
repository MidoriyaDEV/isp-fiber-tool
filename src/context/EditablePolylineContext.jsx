import { useCallback } from "react";
import toast from "react-hot-toast";
import { createContext, useRef, useState } from "react";

// Contexto para gerenciar polilinhas editáveis no mapa
// Fornece estado e funções para adicionar vértices, selecionar uma polilinha e resetar
export const CreatedEditablePolylineContext = createContext({
  polylineRef: {},          // referência à polilinha do Google Maps
  parent: {},               // polilinha pai selecionada
  coordinates: [],          // lista de coordenadas da polilinha em edição
  setParent: () => {},      // define a polilinha pai e inicializa coordenadas
  setCoordinates: () => {}, // define manualmente as coordenadas
  addVertex: () => {},      // adiciona um novo ponto à polilinha
  reset: () => {},          // limpa seleção e coordenadas
});

// Provider que envolve os componentes filhos e fornece o contexto
export const EditableContextProvider = ({ children }) => {
  const polylineRef = useRef(null);         // referência mutável da polilinha
  const [parent, setParentPolyline] = useState(null); // polilinha pai selecionada
  const [coordinates, setCoordinates] = useState([]); // coordenadas da polilinha

  // Define a polilinha pai e opcionalmente inicializa coordenadas
  const setParent = useCallback((polyline, latLng) => {
    setParentPolyline(polyline);
    if (latLng) {
      setCoordinates([latLng.toJSON()]); // converte LatLng para objeto JSON
    }
    toast.success(`${polyline.type} selected`); // notificação visual
  }, []);

  // Adiciona um novo vértice à polilinha
  const addVertex = useCallback((event) => {
    setCoordinates((prevState) => [...prevState, event.latLng.toJSON()]);
  }, []);

  // Reseta o contexto, limpando seleção e coordenadas
  const reset = useCallback(() => {
    setParentPolyline(null);
    setCoordinates([]);
  }, []);

  return (
    <CreatedEditablePolylineContext.Provider
      value={{
        polylineRef,
        setParent,
        parent,
        coordinates,
        setCoordinates,
        addVertex,
        reset,
      }}
    >
      {children} {/* Sempre renderiza os componentes filhos */}
    </CreatedEditablePolylineContext.Provider>
  );
};
