// src/components/SubmitForm/SubmitForm.jsx
import React from "react";
import { Modal, Tab, Tabs } from "react-bootstrap";
import useEditablePolyline from "../../hooks/useEditablePolyline";
import CompanyForm from "./Forms/CompanyForm";
import HomeForm from "./Forms/HomeForm";
import LocalFiberForm from "./Forms/LocalFiberForm";
import PointToPointForm from "./Forms/PointToPointForm";
import ResellerForm from "./Forms/ResellerForm";
import SplitterForm from "./Forms/SplitterForm";

const SubmitForm = ({ show, handleClose, initialTab = null }) => {
  const { parent, coordinates } = useEditablePolyline();

  // Caso especial: não há parent, mas tem coordenadas => PointToPoint
  if (!parent && coordinates.length > 1) {
    return <PointToPointForm parent={parent} show={show} handleClose={handleClose} />;
  }

  // Função para gerar abas dependendo do tipo de parent
  const getTabs = () => {
    switch (parent?.type) {
      case "pointToPoint":
        return [
          { key: "reseller", title: "Adicionar Revendedor", component: <ResellerForm handleClose={handleClose} /> },
          { key: "company", title: "Adicionar Empresa", component: <CompanyForm parent={parent} handleClose={handleClose} /> },
        ];
      case "reseller":
      case "localFiber":
        return [
          { key: "splitter", title: "Adicionar Divisor", component: <SplitterForm handleClose={handleClose} /> },
          { key: "localFiber", title: "Adicionar Fibra Local", component: <LocalFiberForm handleClose={handleClose} /> },
        ];
      case "splitter":
        return [
          { key: "home", title: "Adicionar Residência", component: <HomeForm handleClose={handleClose} /> },
          { key: "splitter", title: "Adicionar Divisor", component: <SplitterForm handleClose={handleClose} /> },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabs();
  if (tabs.length === 0) return null;

  const defaultActive = initialTab ?? tabs[0].key;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      fullscreen="md-down"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Novo Elemento</Modal.Title>
      </Modal.Header>
      <Tabs defaultActiveKey={defaultActive} className="mt-1 mx-2 custom-tabs">
        {tabs.map(({ key, title, component }) => (
          <Tab eventKey={key} title={title} key={key}>
            <div className="tab-inner p-3">{component}</div>
          </Tab>
        ))}
      </Tabs>
    </Modal>
  );
};

export default SubmitForm;