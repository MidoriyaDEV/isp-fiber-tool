import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import axiosInstance from "../../../utility/axios";

import useEditablePolyline from "../../../hooks/useEditablePolyline";
import usePolylines from "../../../hooks/usePolylines";

import CoreSelect from "../../Shared/Form/CoreSelect";

const PointToPointForm = ({ show, handleClose }) => {
  const { coordinates, reset } = useEditablePolyline();
  const { addPolyline } = usePolylines(); // Alterado para addPolyline

  const [formData, setFormData] = useState({
    name: "",
    coreCount: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coordinates || coordinates.length === 0) {
      toast.error("Nenhum ponto selecionado para criar a conexão");
      return;
    }

    const { name, coreCount } = formData;

    // Converte para LatLng caso seja apenas {lat, lng} simples
    const latLngArray = coordinates.map(c => new window.google.maps.LatLng(c.lat, c.lng));

    const length = window.google.maps.geometry.spherical.computeLength(latLngArray);

    const newPointToPointConnection = {
      name,
      totalCore: parseInt(coreCount),
      coordinates,
      length,
    };

    try {
      await toast.promise(
        axiosInstance.post("/ptp-connection", newPointToPointConnection),
        {
          loading: () => "Adicionando nova conexão da empresa...",
          success: ({ data }) => {
            const savedConnection = data?.data;
            if (savedConnection) {
              addPolyline(savedConnection); // adiciona direto no contexto
            }
            reset();
            handleClose();
            return `Conexão ${savedConnection?.type || "Ponto a Ponto"} adicionada com sucesso`;
          },
          error: (error) => {
            console.error(error?.response || error);
            const msg =
              error?.response?.data?.errors?.[0]?.msg ||
              error?.response?.data?.message ||
              "Erro desconhecido";
            return msg;
          },
        }
      );
    } catch (err) {
      console.error("Erro ao salvar conexão:", err);
      toast.error("Falha ao adicionar conexão");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Conexão Ponto a Ponto</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Digite o Nome:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nome da Área"
              name="name"
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <CoreSelect name="coreCount" onChange={handleChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
          <Button variant="primary" type="submit">
            Enviar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PointToPointForm;
