import React, {useState} from 'react';
import {FreeSpaceLogger} from 'components/free_space_logger/FreeSpaceLogger';

import './storage_abuser.css';
import {BaseAbuser} from 'services/base_abuser';

const CHUNK_OPTIONS = [
  {value: 5, label: '5KB'},
  {value: 50, label: '50KB'},
  {value: 500, label: '500KB'},
  {value: 5 * 1024, label: '5MB'},
  {value: 50 * 1024, label: '50MB'},
  {value: 500 * 1024, label: '500MB'},
];

interface Props {
  abuser: BaseAbuser;
}

export function StorageAbuser({abuser}: Props) {
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
            abuser.fill(chunkSize, quantity);
          }}>
          Fill
        </button>
        <button
          onClick={() => {
            abuser.clear();
          }}>
          Clear
        </button>
        <button
          onClick={() => {
            abuser.startAutoFill(chunkSize);
          }}>
          Auto fill
        </button>
        <button
          onClick={() => {
            abuser.stopAutoFill();
          }}>
          Stop auto fill
        </button>
      </div>
    </div>
  );
}
