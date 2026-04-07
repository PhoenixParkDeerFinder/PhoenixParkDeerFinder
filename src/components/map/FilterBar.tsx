import "./FilterBar.css";
import { useAnimals } from "../../hooks/useAnimals";
import type { Animal } from "../../types";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  type SelectChangeEvent,
} from "@mui/material";
import React from "react";



export default function FilterBar() {
  const {animals, loading } = useAnimals();
  const [animal, setAnimal] = React.useState("");
  const [hours, setHours] = React.useState<number>(2);

  const changeAnimal = (event: SelectChangeEvent) => {
    setAnimal(event.target.value);
  };

  const changeHours = (event: Event, newValue: number) => {
    setHours(newValue);
    
  console.log(event)
  };

  if (loading) return null;

  //just to stop ESLINT from crying
  console.log(hours)

  return (
    <div className="filter-bar">
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="animal-select-label">Animal</InputLabel>
          <Select
            labelId="animal-select-label"
            id="animal-select"
            value={animal}
            label="Animal"
            onChange={changeAnimal}
          >
            {animals.map((animal: Animal) => (
              <MenuItem value={animal.id}>{animal.common_name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <div className="filter-time">
        <Box>
          <Slider
            aria-label="Hours"
            defaultValue={30}
            onChange={changeHours}
            valueLabelDisplay="off"
            shiftStep={30}
            step={2}
            marks
            min={2}
            max={48}
          />
        </Box>
      </div>
    </div>
  );
}
