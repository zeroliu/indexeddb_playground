import React, {useState} from 'react';
import {FreeSpaceLogger} from 'components/free_space_logger/FreeSpaceLogger';

import './storage_abuser.css';

const CHUNK_OPTIONS = [
  {value: 5, label: '5KB'},
  {value: 50, label: '50KB'},
  {value: 500, label: '500KB'},
  {value: 5 * 1024, label: '5MB'},
  {value: 50 * 1024, label: '50MB'},
  {value: 500 * 1024, label: '500MB'},
];

type FillAbuserFunc = (size: number, quantity: number) => void;
type ClearAbuserFunc = () => void;

interface Props {
  fillAbuser: FillAbuserFunc;
  clearAbuser: ClearAbuserFunc;
}

export function StorageAbuser({fillAbuser, clearAbuser}: Props) {
  const [chunkSize, setChunkSize] = useState(CHUNK_OPTIONS[0].value);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="storage-abuser">
      <FreeSpaceLogger />
      <label>
        Chunk Size:
        <select
          value={chunkSize}
          onChange={event => {
            setChunkSize(Number(event.target.value));
          }}>
          {CHUNK_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity:
        <input
          type="number"
          value={quantity}
          min="1"
          onChange={event => {
            setQuantity(Number(event.target.value));
          }}
        />
      </label>
      <div className="storage-abuser-btn-group">
        <button
          onClick={() => {
            fillAbuser(chunkSize, quantity);
          }}>
          Fill
        </button>
        <button
          onClick={() => {
            clearAbuser();
          }}>
          Clear
        </button>
      </div>
    </div>
  );
}
