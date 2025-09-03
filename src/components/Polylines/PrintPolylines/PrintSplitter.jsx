// ============================
// PrintSplitter.js
// ============================
// Componente React para exibir um splitter (divisor de fibra óptica) no mapa do Google Maps.
// Inclui:
// 1. Linha (Polyline) conectando os pontos do splitter.
// 2. Marker na última posição do splitter.
// 3. InfoWindow com detalhes do splitter e botão de exclusão.
// ============================

import { InfoWindow, Marker, Polyline } from "@react-google-maps/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import splitterImage from "../../../assets/img/splitter.png"; // ícone do splitter
import useEditablePolyline from "../../../hooks/useEditablePolyline"; // hook para edição de polilinhas
import usePolylines from "../../../hooks/usePolylines"; // hook para atualizar polilinhas globais
import axiosInstance from "../../../utility/axios"; // instância do axios
import coreColor from "../../../utility/coreColor"; // cores padrão dos núcleos

const PrintSplitter = ({ connection }) => {
  // Estado das coordenadas da Polyline
  const [coordinates, setCoordinates] = useState([]);
  const { setFetch } = usePolylines(); // atualizar polilinhas globalmente

  // Hook para setar o splitter como "selecionado"
  const { setParent } = useEditablePolyline();

  // Estado da InfoWindow
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [position, setPosition] = useState(null);

  // Dados da conexão recebidos via props
  const {
    _id,
    name,
    parentType,
    color,
    location,
    splitterLimit,
    splitterUsed,
    portNo,
    type,
    childrens,
    totalCore,
    length,
  } = connection;

  // Converte coordenadas do backend para {lat, lng} usado pelo Google Maps
  useEffect(() => {
    if (location?.coordinates) {
      const coords = location.coordinates.map((item) => ({ lng: item[0], lat: item[1] }));
      setCoordinates(coords);
    }
  }, [location.coordinates]);

  // Configurações visuais da linha (Polyline)
  const options = {
    geodesic: true,
    strokeColor: color ? coreColor.find((item) => item.colorName === color)?.colorCode : "#24A19C",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  };

  // Conexões filhas do splitter (renderizadas na InfoWindow)
  const ChildConnection = childrens.map((item) => (
    <p className="mb-1" key={item.color + item.connectionType}>
      {item.color}: {item.connectionType}
    </p>
  ));

  // Ícone do Marker
  const icon = {
    url: splitterImage,
    scaledSize: new window.google.maps.Size(30, 30),
    origin: new window.google.maps.Point(0, 0),
    anchor: new window.google.maps.Point(15, 15),
  };

  // Ao clicar no Marker, seta como splitter "selecionado"
  const onClickHandler = (event) => {
    setParent(connection, event.latLng);
  };

  // Deletar splitter via API
  const deleteHandler = () => {
    toast.promise(axiosInstance.delete(`/splitter-connection?id=${_id}`), {
      loading: "Excluindo...",
      success: () => {
        setFetch(true); // força atualização global
        return "Divisor excluído com sucesso";
      },
      error: ({
        response: {
          data: { message },
        },
      }) => message,
    });
  };

  return (
    <>
      {/* ---------------------------
          Polyline: Linha do splitter
      --------------------------- */}
      <Polyline
        path={coordinates}
        options={options}
        onRightClick={({ latLng }) => {
          setPosition(latLng);
          setShowInfoWindow(true); // abre InfoWindow ao clicar com botão direito
        }}
      />

      {/* ---------------------------
          Marker: Último ponto da Polyline
      --------------------------- */}
      <Marker
        position={
          coordinates[coordinates.length - 1] &&
          new window.google.maps.LatLng({
            lat: coordinates[coordinates.length - 1]?.lat,
            lng: coordinates[coordinates.length - 1]?.lng,
          })
        }
        onClick={onClickHandler} // seleciona o splitter
        icon={icon}
        onRightClick={({ latLng }) => {
          setPosition(latLng);
          setShowInfoWindow(true);
        }}
      />

      {/* ---------------------------
          InfoWindow: Detalhes do splitter
      --------------------------- */}
      {showInfoWindow && (
        <InfoWindow position={position} onCloseClick={() => setShowInfoWindow(false)}>
          <>
            <p className="mb-1 fw-bold">{name}</p>
            <hr className="my-1" />
            <p className="mb-1">
              <span className="fw-bold">Conectado com:</span> {parentType}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Tipo de Divisor:</span> 1 para {splitterLimit}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Tipo de Conexão:</span> {type}
            </p>
            {portNo && <p className="mb-1"><span className="fw-bold">Número da Porta:</span> {portNo}</p>}
            {color && <p className="mb-1"><span className="fw-bold">Cor do Núcleo Conectado:</span> {color}</p>}
            <p className="mb-1"><span className="fw-bold">Núcleos Utilizados:</span> {splitterUsed}/{splitterLimit}</p>
            <p className="mb-1"><span className="fw-bold">Distância:</span> {length.toFixed(2)}m</p>
            <p className="mb-1"><span className="fw-bold">Total de Núcleos:</span> {totalCore}</p>
            <button className="badge mb-1 bg-danger border-0" onClick={deleteHandler}>Excluir</button>
            <p className="mb-1 fw-bold">Conexões Filhas: </p>
            <hr className="my-1 w-50" />
            {ChildConnection}
          </>
        </InfoWindow>
      )}
    </>
  );
};

export default PrintSplitter;
