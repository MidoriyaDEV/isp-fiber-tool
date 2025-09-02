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
          { key: "reseller", title: "Add Reseller", component: <ResellerForm handleClose={handleClose} /> },
          { key: "company", title: "Add Company", component: <CompanyForm parent={parent} handleClose={handleClose} /> },
        ];
      case "reseller":
      case "localFiber":
        return [
          { key: "splitter", title: "Add Splitter", component: <SplitterForm handleClose={handleClose} /> },
          { key: "localFiber", title: "Add Local Fiber", component: <LocalFiberForm handleClose={handleClose} /> },
        ];
      case "splitter":
        return [
          { key: "home", title: "Add Home", component: <HomeForm handleClose={handleClose} /> },
          { key: "splitter", title: "Add Splitter", component: <SplitterForm handleClose={handleClose} /> },
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
      <Tabs defaultActiveKey={defaultActive} className="mt-1 mx-2 custom-tabs">
        {tabs.map(({ key, title, component }) => (
          <Tab eventKey={key} title={title} key={key}>
            <div className="tab-inner">{component}</div>
          </Tab>
        ))}
      </Tabs>
    </Modal>
  );
};

export default SubmitForm;
