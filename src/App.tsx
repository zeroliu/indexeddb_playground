import React from 'react';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  dialog: {
    width: '50vw',
    height: '50vh',
    border: '1px solid red',
  },
};

function handleClick() {
  console.log('click');
}

function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
}

function App() {
  return (
    <div style={styles.container}>
      <div style={styles.dialog}>
        <form onSubmit={handleSubmit}>
          <button onClick={handleClick}>Add data</button>
        </form>
      </div>
    </div>
  );
}

export default App;
