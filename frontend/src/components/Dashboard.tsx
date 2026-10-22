function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to Shortly.</p>

      <form>
        <input
          type="url"
          placeholder="Paste your long URL"
        />

        <button type="submit">
          Shorten URL
        </button>
      </form>
    </div>
  );
}

export default Dashboard;