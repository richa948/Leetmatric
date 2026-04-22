document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const statsContainer = document.querySelector(".stats-container");

  const loader = document.getElementById("loader");

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
   
  //Error message
  function showError(message) {
    statsContainer.innerHTML = `<p class="error">${message}</p>`;
  }

  // Fetch LeetCode data
 async function fetchUserDetails(username) {
   try {
     loader.classList.remove("hidden");
     statsContainer.innerHTML = "";

     searchButton.textContent = "Searching...";
     searchButton.disabled = true;

     // ✅ trim username before sending
     const cleanUsername = username.trim();

     if (!cleanUsername) {
       showError("Username is required");
       return;
     }

     const response = await fetch("/api/leetcode", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
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
         variables: {
           username: cleanUsername, // ✅ FIXED
         },
       }),
     });

     const parsedData = await response.json();

     console.log("API DATA:", parsedData);

     // ✅ Proper error handling
     if (!response.ok) {
       showError(parsedData.error || "API Error");
       return;
     }

     displayUserData(parsedData);
   } catch (error) {
     console.error(error);
     showError("Failed to fetch data");
   } finally {
     loader.classList.add("hidden");
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
   if (!parsedData?.data?.matchedUser) {
     showError("User not found");
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

   cardStatsContainer.innerHTML = "";

   cardsData.forEach((data) => {
     const card = document.createElement("div");
     card.className = "card";

     const title = document.createElement("h3");
     title.textContent = data.level;

     const value = document.createElement("p");
     value.textContent = data.value;

     card.appendChild(title);
     card.appendChild(value);

     cardStatsContainer.appendChild(card);
   });
  }

  // Button click
  searchButton.addEventListener("click", function () {
     if (searchButton.disabled) return;
    const username = usernameInput.value;

    console.log(username);

    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
