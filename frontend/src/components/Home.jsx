import React from "react";
import { Link } from "react-router-dom";
import "./HomeStyles.css";

const Home = () => {
  return (
    <div className="home">
      <h1>Ranked Choice Voting</h1>
      <div className="description">
        <p className="intro">
          Create polls, collect votes, and get fair results with instant runoff voting.
        </p>
        <div className="features">
          <Link to="/create-poll" className="feature-link">
            <div className="feature">
              <h3>Create Polls</h3>
              <p>Set up polls with multiple options and customize them to your needs.</p>
            </div>
          </Link>
          <div className="feature">
            <h3>Share & Vote</h3>
            <p>Generate shareable links so voters can rank their choices in order of preference.</p>
          </div>
          <div className="feature">
            <h3>Fair Results</h3>
            <p>Results are calculated using the instant runoff voting algorithm, ensuring the most preferred option wins.</p>
          </div>
        </div>
        <div className="home-actions">
          <Link to="/browse-polls" className="browse-polls-btn">
            Browse All Polls
          </Link>
          <Link to="/create-poll" className="create-poll-btn">
            Create a Poll
          </Link>
        </div>
        <p className="cta">
          Get started by creating your first poll or browse existing ones!
        </p>
      </div>
    </div>
  );
};

export default Home;
