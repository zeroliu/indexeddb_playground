import React, {FormEvent, useState} from 'react';
import {abuseIdb} from 'services/idb';

const styles = {
  dialog: {
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,.2)',
  },
};

const CHUNK_OPTIONS = [
  {value: 5, label: '5KB'},
  {value: 50, label: '50KB'},
  {value: 500, label: '500KB'},
  {value: 5 * 1024, label: '5MB'},
  {value: 50 * 1024, label: '50MB'},
  {value: 500 * 1024, label: '500MB'},
];

export function App() {
  const [chunkSize, setChunkSize] = useState(CHUNK_OPTIONS[0].value);
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(chunkSize, quantity);
    abuseIdb(chunkSize, quantity);
  };

  return (
    <div>
      <div style={styles.dialog}>
        <form onSubmit={handleSubmit}>
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
              onChange={event => {
                setQuantity(Number(event.target.value));
              }}
            />
          </label>
          <input type="submit" value="Fill" />
        </form>
      </div>
    </div>
  );
}
