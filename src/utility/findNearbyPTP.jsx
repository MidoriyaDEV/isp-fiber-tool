import React, { useCallback } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";

import useEditablePolyline from "../../hooks/useEditablePolyline";
import usePolylines from "../../hooks/usePolylines";
import axiosInstance from "../../utility/axios";

import findNearByPTP from "../../utility/findNearByPTP";

const NearbyConnection = () => {
  const { coordinates: target, addVertex, setParent, reset } = useEditablePolyline();
  const { polylines, addPolyline } = usePolylines();

  const validateTarget = useCallback(() => {
    if (!target || target.length !== 1) {
      toast.error("Selecione apenas um alvo");
      return false;
    }
    return true;
  }, [target]);

  const findNearbyPointToPointConnection = useCallback(async () => {
    if (!validateTarget()) return;

    try {
      const response = await axiosInstance.get(
        `/ptp-connection?coordinates=${JSON.stringify({ lat: target[0].lat, lng: target[0].lng })}`
      );

      const coordinates = response?.data?.data?.location?.coordinates;
      const _id = response?.data?.data?.location?._id;

      if (!coordinates || !_id) {
        toast.error("Conexão PTP não encontrada");
        return;
      }

      // Procura se já existe no contexto
      let targetPolyline = polylines.find(item => item._id === _id);
      if (!targetPolyline) {
        targetPolyline = { _id, coordinates };
        addPolyline(targetPolyline);
      }

      // Calcula o caminho real usando Turf + DirectionsService
      findNearByPTP(coordinates.map(([lng, lat]) => ({ lat, lng })), target[0], (result) => {
        if (result.length === 0) {
          toast.error("Nenhum caminho válido encontrado");
          return;
        }

        // Adiciona os pontos calculados como polyline temporária
        const animatedPolyline = {
          _id: `${_id}-calculated`,
          coordinates: result.map(p => ({ lat: p.lat(), lng: p.lng() })),
        };
        addPolyline(animatedPolyline);

        // Se quiser animar ponto a ponto:
        result.forEach((p, i) => {
          setTimeout(() => addVertex({ latLng: { lat: p.lat(), lng: p.lng() } }), 200 * i);
        });
      });

    } catch (err) {
      console.error(err);
      toast.error("Falha ao buscar conexão PTP");
    }
  }, [target, polylines, validateTarget, addPolyline, addVertex, setParent, reset]);

  return (
    <div className="d-flex" style={{ gap: "12px" }}>
      <Button
        className="nearbyPTP"
        variant="dark"
        onClick={findNearbyPointToPointConnection}
        disabled={!target || target.length === 0}
      >
        Encontrar PTP Próximo
      </Button>
    </div>
  );
};

export default NearbyConnection;
