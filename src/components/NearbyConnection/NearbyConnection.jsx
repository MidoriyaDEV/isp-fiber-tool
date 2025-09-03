import React, { useCallback } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";

import useEditablePolyline from "../../hooks/useEditablePolyline";
import usePolylines from "../../hooks/usePolylines";
import axiosInstance from "../../utility/axios";

import findNearbyPTP from "../../utility/findNearbyPTP";
import findNearbySplitter from "../../utility/findNearbySplitter";

const NearbyConnection = () => {
  const { coordinates: target, addVertex, setParent, reset } = useEditablePolyline();
  const { polylines, addPolyline } = usePolylines();

  // Valida o alvo selecionado
  const validateTarget = useCallback(() => {
    if (target.length === 0) {
      toast.error("Selecione um alvo primeiro");
      return false;
    }
    if (target.length > 1) {
      toast.error("Apenas um alvo é permitido");
      return false;
    }
    return true;
  }, [target.length]);

  // Processa os vértices com animação
  const processVerticesWithAnimation = useCallback((vertices, targetPolyline) => {
    if (!vertices || vertices.length === 0) {
      toast.error("Nenhum vértice encontrado para processar");
      return;
    }

    reset();
    setParent(targetPolyline);

    vertices.forEach((vertex, index) => {
      setTimeout(() => addVertex({ latLng: vertex }), 200 * index);
    });
  }, [addVertex, reset, setParent]);

  // Encontrar PTP próximo
  const findNearbyPointToPointConnection = useCallback(async () => {
    if (!validateTarget()) return;

    try {
      const response = await axiosInstance.get(
        `/ptp-connection?coordinates=${JSON.stringify({ lat: target[0].lat, lng: target[0].lng })}`
      );

      const coordinates = response?.data?.data?.location?.coordinates;
      const _id = response?.data?.data?.location?._id;

      if (!coordinates || !_id) {
        toast.error("Conexão PTP não encontrada ou inválida");
        return;
      }

      // Adiciona a polilinha no contexto caso ainda não exista
      let targetPolyline = polylines.find(item => item._id === _id);
      if (!targetPolyline) {
        targetPolyline = { _id, coordinates }; // Ajuste de acordo com a estrutura do seu polylines
        addPolyline(targetPolyline);
      }

      findNearbyPTP(coordinates, target[0], (result) => {
        processVerticesWithAnimation(result, targetPolyline);
      });

    } catch (error) {
      console.error("Erro ao buscar conexão PTP:", error);
      toast.error("Falha ao buscar conexão ponto a ponto");
    }
  }, [target, polylines, validateTarget, processVerticesWithAnimation, addPolyline]);

  // Encontrar Splitter próximo
  const findNearbySplitterConnection = useCallback(async () => {
    if (!validateTarget()) return;

    try {
      const response = await axiosInstance.get(
        `/splitter-connection?coordinates=${JSON.stringify({ lat: target[0].lat, lng: target[0].lng })}`
      );

      const coordinates = response?.data?.data?.lastPoint?.coordinates;
      const _id = response?.data?.data?.lastPoint?._id;

      if (!coordinates || !_id) {
        toast.error("Conexão Splitter não encontrada ou inválida");
        return;
      }

      // Adiciona a polilinha no contexto caso ainda não exista
      let targetPolyline = polylines.find(item => item._id === _id);
      if (!targetPolyline) {
        targetPolyline = { _id, coordinates };
        addPolyline(targetPolyline);
      }

      const splitterLatLng = new window.google.maps.LatLng(coordinates[1], coordinates[0]);
      const targetLatLng = new window.google.maps.LatLng(target[0].lat, target[0].lng);

      findNearbySplitter(splitterLatLng, targetLatLng, (result) => {
        processVerticesWithAnimation(result, targetPolyline);
      });

    } catch (error) {
      console.error("Erro ao buscar conexão com splitter:", error);
      toast.error("Falha ao buscar conexão com splitter");
    }
  }, [target, polylines, validateTarget, processVerticesWithAnimation, addPolyline]);

  return (
    <div className="d-flex" style={{ gap: "12px" }}>
      <Button
        className="nearbyPTP"
        variant="dark"
        onClick={findNearbyPointToPointConnection}
        disabled={target.length === 0}
      >
        Encontrar PTP Próximo
      </Button>

      <Button
        className="nearbySplitter"
        variant="dark"
        onClick={findNearbySplitterConnection}
        disabled={target.length === 0}
      >
        Encontrar Splitter Próximo
      </Button>
    </div>
  );
};

export default NearbyConnection;
