document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const statsContainer = document.getElementById("stats-container");

  const easyProgressCircle = document.getElementById("easy-progress");
  const mediumProgressCircle = document.getElementById("medium-progress");
  const hardProgressCircle = document.getElementById("hard-progress");

  const easyLevel = document.getElementById("easy-level");
  const mediumLevel = document.getElementById("medium-level");
  const hardLevel = document.getElementById("hard-level");

  const cardStatsContainer = document.getElementById("stats-card");

  // Username validation
  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }

    const regex = /^[a-zA-Z0-9_-]{1,15}$/;

    const isMatching = regex.test(username);

    if (!isMatching) {
      alert("Invalid username");
    }

    return isMatching;
  }

  // Fetch LeetCode data
  async function fetchUserDetails(username) {
    try {
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;
    //   statsContainer.classList.add("hidden") 

      const graphql = JSON.stringify({
        query: `
        query userSessionProgress($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
              totalSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
        }
        `,
        variables: { username: username },
      });

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: graphql,
      };

      const response = await fetch("/api/leetcode", requestOptions);

      if (!response.ok) {
        throw new Error("Unable to fetch user details");
      }

      const parsedData = await response.json();

      console.log(parsedData);

      displayUserData(parsedData);
    } catch (error) {
      statsContainer.innerHTML = `<p>${error.message}</p>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  // Update progress circles
  function updateProgress(solved, total, level, circle) {
    if (!circle || !level) return;

    const progressDegree = (solved / total) * 360;

    circle.style.setProperty("--progress-degree", `${progressDegree}deg`);

    level.textContent = `${solved}/${total}`;
  }

  // Display user data
  function displayUserData(parsedData) {
    if (!parsedData.data.matchedUser) {
      statsContainer.innerHTML = `<p>User not found</p>`;
      return;
    }

    const allQuestions = parsedData.data.allQuestionsCount;

    const totalEasyQues = allQuestions[1].count;
    const totalMediumQues = allQuestions[2].count;
    const totalHardQues = allQuestions[3].count;

    const submissionStats =
      parsedData.data.matchedUser.submitStats.acSubmissionNum;

    const solvedEasy = submissionStats[1].count;
    const solvedMedium = submissionStats[2].count;
    const solvedHard = submissionStats[3].count;

    updateProgress(solvedEasy, totalEasyQues, easyLevel, easyProgressCircle);

    updateProgress(
      solvedMedium,
      totalMediumQues,
      mediumLevel,
      mediumProgressCircle,
    );

    updateProgress(solvedHard, totalHardQues, hardLevel, hardProgressCircle);


    const totalSubmissionStats =
      parsedData.data.matchedUser.submitStats.totalSubmissionNum;

    const cardsData = [
      {
        level: "Overall Submissions",
        value: totalSubmissionStats[0].submissions,
      },

      {
        level: "Easy Submissions",
        value: totalSubmissionStats[1].submissions,
      },

      {
        level: "Medium Submissions",
        value: totalSubmissionStats[2].submissions,
      },

      {
        level: "Hard Submissions",
        value: totalSubmissionStats[3].submissions,
      },
    ];

    cardStatsContainer.innerHTML = cardsData
      .map(
        (data) => `
        <div class="card">
          <h3>${data.level}</h3>
          <p>${data.value}</p>
        </div>
      `,
      )
      .join("");
  }

  // Button click
  searchButton.addEventListener("click", function () {
    const username = usernameInput.value;

    console.log(username);

    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
