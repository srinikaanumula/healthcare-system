import React, { useState, useEffect, useMemo } from "react";
import Axios from "axios";
import {
  Row,
  Col,
  Input,
  Button,
  InputGroup,
  InputGroupAddon,
  Spinner
} from "reactstrap";

import Trie from "./Trie.js";
import specialization from "./specialization";
import { Link } from "react-router-dom";
import getServerUrl from "../utils/url";

const Search = () => {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [Doctor, setDoctor] = useState([]);
  const [loading, setLoading] = useState(true);

  const memoized_trie = useMemo(() => {
    const trie = new Trie();
    for (let i = 0; i < specialization.length; i++) {
      trie.insert(specialization[i]);
    }
    return trie;
  }, []);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const res = await Axios.get(`${getServerUrl()}/doctors/`);
      if (res && Array.isArray(res.data)) {
        setDoctor(res.data);
      } else {
        setDoctor([]);
      }
    } catch (err) {
      console.error("Error fetching doctors list:", err);
      setDoctor([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  function onTextChanged(e) {
    const value = e.target.value || "";
    setText(value);
    const valLower = value.toLowerCase().trim();
    if (valLower !== "") {
      setSuggestions(memoized_trie.find(valLower));
    } else {
      setSuggestions([]);
      fetchDoctor();
    }
  }

  function suggestionSelected(value) {
    setText(value);
    setSuggestions([]);
    UpdateDisplay(value);
  }

  function renderSuggestions() {
    if (!suggestions || suggestions.length === 0) {
      return null;
    }
    return (
      <InputGroup>
        <ul className="list-group dropdown-menu pt-0 pb-0 show" style={{ position: 'relative', width: '100%', zIndex: 10 }}>
          {suggestions.map((item) => (
            <li
              className="list-group-item list-group-item-action cursor-pointer"
              onClick={() => suggestionSelected(item)}
              key={item}
              style={{ cursor: 'pointer' }}
            >
              {item} 
            </li>
          ))}
        </ul>
      </InputGroup>
    );
  }

  const UpdateDisplay = (searchText) => {
    if (!searchText || searchText.trim() === "") {
      fetchDoctor();
      return;
    }
    setDoctor((prevDocs) => {
      if (!Array.isArray(prevDocs)) return [];
      return prevDocs.filter(
        (doc) => doc && doc.specialization && doc.specialization.toLowerCase().includes(searchText.toLowerCase().trim())
      );
    });
  };

  return (
    <div>
      <Row className="mb-3">
        <Col>
          <InputGroup>
            <Input
              value={text}
              type="text"
              placeholder="Search Doctor by Specialty (e.g. Cardiology, Dermatology, Pediatrics)"
              onChange={onTextChanged}
              className="mb-1"
            />
            <InputGroupAddon addonType="append">
              <Button
                color="primary"
                onClick={() => UpdateDisplay(text)}
              >
                Search Doctor
              </Button>
              <Button
                color="secondary"
                onClick={() => { setText(""); fetchDoctor(); }}
                className="ml-1"
              >
                Reset
              </Button>
            </InputGroupAddon>
          </InputGroup>
          {renderSuggestions()}
        </Col>
      </Row>

      <div
        style={{ overflowY: "auto", overflowX: "hidden", maxHeight: "64vh", width: "100%" }}
        className="col-12 col-md-12 p-0"
      >
        {loading ? (
          <div className="text-center p-5">
            <Spinner color="warning" />
            <p className="text-white mt-2 small">Loading available doctor profiles...</p>
          </div>
        ) : Array.isArray(Doctor) && Doctor.length > 0 ? (
          <div className="row">
            {Doctor.map((doc) => (
              <div className="col-sm-6 mb-3" key={doc._id || doc.username || Math.random()}>
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="text-primary font-weight-bold mb-1">
                        Dr. <span className="text-uppercase">{doc.name}</span>
                      </h6>
                      <div className="badge badge-info p-1 mb-2">{doc.specialization}</div>
                      <div className="small text-muted mb-1">📞 {doc.phoneNumber || "Not provided"}</div>
                      <div className="small text-muted mb-2">⏱ {doc.timing || "09:00 AM - 05:00 PM"}</div>
                    </div>
                    <div className="row align-items-center mt-2 pt-2 border-top">
                      <div className="col-6 font-weight-bold text-success">
                        ₹ {doc.feesPerSession}
                      </div>
                      <div className="col-6 text-right">
                        <Link to={{ pathname: "/patient/selectdate", doctor: { doctor: doc } }}>
                          <button className="btn btn-sm btn-primary font-weight-bold px-3">
                            Book Slot
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="col-12 text-center p-5 bg-dark text-white border border-secondary rounded">
            <h5 className="mb-2">No doctors currently match your search</h5>
            <p className="text-muted small mb-3">Try searching for a different specialty or click "Reset" to view all available doctors.</p>
            <Button color="outline-warning" size="sm" onClick={() => { setText(""); fetchDoctor(); }}>
              Show All Doctors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
