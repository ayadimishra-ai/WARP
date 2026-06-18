import React from "react";
import {
  GetGHGEstimationUrl
} from "../../config";
const AddLocations = () => {
  return (
    <iframe 
    title="Add Locations"
    id="Add Locations"
    // src={item.url.replace((localStorage.opsUserCompanyId + '/embed/v1/' + localStorage.opsToken + '/organization-details'))}
    // src="http://localhost:3000/cfe37694-341f-4ff7-afe4-97e0e77eaf7e/embed/v1/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6Ik9yZ2FuaXphdGlvbkFkbWluIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJPcmdhbml6YXRpb25BZG1pbiJdLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzQ1YWVkODQtNzcwYy00YTRmLThkMjItYjU4M2I0NjY0ZTZiIiwieC1oYXN1cmEtb3JnLWlkIjoiY2ZlMzc2OTQtMzQxZi00ZmY3LWFmZTQtOTdlMGU3N2VhZjdlIiwieC1oYXN1cmEtaXMtQUktZW5hYmxlZCI6ImZhbHNlIn0sInVzZXJfZW1haWwiOiJhZG1pbkBhdGhlci5jb20iLCJpYXQiOjE3NTQ5ODc2ODEsImV4cCI6MTc1NTA3NDA4MX0.yXdKl49-pVw_o1MqTDtbpHALwd1BM60jDjMjEqI17IQ/add-location"
    src={
            GetGHGEstimationUrl() +
            localStorage.opsUserCompanyId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/add-location"
          }
    style={{ width: "100%", height: "100vh", border: "none" }} />
  );
};

export default AddLocations;
