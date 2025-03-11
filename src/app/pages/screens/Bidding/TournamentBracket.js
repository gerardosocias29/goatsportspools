import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { useAxios } from "../../../contexts/AxiosContext";
import { useToast } from "../../../contexts/ToastContext";

const regions = ["East", "West", "South", "Midwest"];
const teamSizes = [64, 32, 16, 8, 4, 2];

const TournamentBracket = ({ visible, onHide, onSuccess = () => {}, data, auctionId }) => {
  const axiosService = useAxios();
  const showToast = useToast();
  const [teams, setTeams] = useState([]);
  const [teamCount, setTeamCount] = useState(data?.items?.length || 64);
  const [selectedTeams, setSelectedTeams] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchTeams();
      if (data?.items?.length) {
        setTeamCount(data.items.length);
        setSelectedTeams(
          data.items.map((item) => ({
            id: item.id,
            team: item.ncaa_team_id,
            seed: item.seed?.toString(),
            region: item.region || null,
          }))
        );
      } else {
        setSelectedTeams(Array(teamCount).fill({ team: null, seed: "", region: "" }));
      }
    }
  }, [visible]);

  const fetchTeams = async () => {
    const response = await axiosService.get("/api/ncaa_teams");
    setTeams(response.data);
  };

  const handleTeamSelect = (index, team) => {
    const updatedTeams = [...selectedTeams];
    updatedTeams[index] = { ...updatedTeams[index], team };
    setSelectedTeams(updatedTeams);
  };

  const handleSeedChange = (index, seed) => {
    const updatedTeams = [...selectedTeams];
    updatedTeams[index] = { ...updatedTeams[index], seed };
    setSelectedTeams(updatedTeams);
  };

  const handleRegionChange = (index, region) => {
    const updatedTeams = [...selectedTeams];
    updatedTeams[index] = { ...updatedTeams[index], region };
    setSelectedTeams(updatedTeams);
  };

  const handleTeamCountChange = (e) => {
    const count = e.value;
    setTeamCount(count);
    setSelectedTeams(Array(count).fill({ team: null, seed: "", region: "" }));
  };

  const isFormComplete = selectedTeams.every(
    (entry) => entry.team && entry.seed && entry.region
  );

  const handleSubmitBracket = async (e) => {
    e.preventDefault();
    const bracketData = { teams: selectedTeams };
    console.log("Submitting bracket:", bracketData);
    const response = await axiosService.post(`/api/auctions/${auctionId}/brackets`, bracketData);
    showToast({
      severity: response.data.status ? "success" : "error",
      summary: response.data.status ? "Success" : "Error",
      detail: response.data.message || "Create bracket failed",
    });
    response.data.status ? onSuccess() : onHide();
  };

  const filteredTeams = (selectedTeam) => {
    return teams.filter((team) => !selectedTeams.some((entry) => entry.team === team.id) || selectedTeam === team.id);
  };

  return (
    <Dialog header="Tournament Bracket" visible={visible} onHide={onHide} className="w-[95%]" draggable={false} resizable={false}>
      <form onSubmit={handleSubmitBracket} className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Select Teams for the Tournament</h2>
          <Dropdown
            value={teamCount}
            options={teamSizes.map((size) => ({ label: `${size} Teams`, value: size }))}
            onChange={handleTeamCountChange}
            placeholder="Select Number of Teams"
            className="w-40"
          />
        </div>
        <p className="mb-4">Select up to {teamCount} teams with their seed and region.</p>
        <div className="grid grid-cols-4 gap-4">
          {selectedTeams.map((entry, index) => (
            <div key={index} className="border p-4 rounded-lg bg-white">
              <Dropdown
                value={entry.team}
                options={filteredTeams(entry.team)}
                onChange={(e) => handleTeamSelect(index, e.value)}
                optionLabel={(option) => `${option.school} - ${option.nickname}`}
                optionValue="id"
                placeholder={`Select Team ${index + 1}`}
                className="w-full mb-2"
                filter
                required
              />
              <InputText
                value={entry.seed}
                onChange={(e) => handleSeedChange(index, e.target.value)}
                placeholder="Seed"
                className="w-full mb-2"
                required
              />
              <Dropdown
                value={entry.region}
                options={regions}
                onChange={(e) => handleRegionChange(index, e.value)}
                placeholder="Select Region"
                className="w-full"
                required
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" label="Submit & Finalize Bracket" className="p-button-success" disabled={!isFormComplete} />
        </div>
      </form>
    </Dialog>
  );
};

export default TournamentBracket;
