let teamMembers = [];
let goatsBoard = {};
let toonsBoard = {};
let memberStats = {};

const prizeValues = {
  1: 7.5,
  2: 5,
  3: 2.5,
  4: 2.5,
  5: 1.25,
  6: 1.25,
  7: 1.25,
  8: 1.25,
  9: 1.25,
  10: 1.25
};

function addTeamMember() {
  const input = document.getElementById('memberInput');
  const name = input.value.trim();

  if (name && !teamMembers.includes(name)) {
    teamMembers.push(name);
    memberStats[name] = {
      goats: 0,
      goatPoints: 0,
      tons: 0,
      tonPoints: 0
    };
    input.value = '';
    renderTeamMembers();
    renderMemberStats();
    updateStatsSummary();
  }
}

function removeTeamMember(name) {
  teamMembers = teamMembers.filter(member => member !== name);
  delete memberStats[name];

  // Remove from both boards
  Object.keys(goatsBoard).forEach(position => {
    if (goatsBoard[position] === name) {
      delete goatsBoard[position];
    }
  });

  Object.keys(toonsBoard).forEach(position => {
    if (toonsBoard[position] === name) {
      delete toonsBoard[position];
    }
  });

  renderTeamMembers();
  renderBoards();
  renderMemberStats();
  updateSummaries();
  updateStatsSummary();
}

function renderTeamMembers() {
  const teamList = document.getElementById('teamList');
  teamList.innerHTML = '';

  teamMembers.forEach(member => {
    const memberElement = document.createElement('div');
    memberElement.className = 'team-member';
    memberElement.draggable = true;
    memberElement.textContent = member;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeTeamMember(member);
    };

    memberElement.appendChild(removeBtn);

    memberElement.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', member);
      memberElement.classList.add('dragging');
    });

    memberElement.addEventListener('dragend', () => {
      memberElement.classList.remove('dragging');
    });

    teamList.appendChild(memberElement);
  });
}

function setupDropZones() {
  const dropZones = document.querySelectorAll('.drop-zone');
  let scrollInterval = null;

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');

      // Get the drop zone's position relative to the viewport
      const rect = zone.getBoundingClientRect();
      const scrollSpeed = 15;
      const scrollThreshold = 100;

      if (scrollInterval) {
        clearInterval(scrollInterval);
      }

      if (rect.top < scrollThreshold) {
        scrollInterval = setInterval(() => {
          window.scrollBy(0, -scrollSpeed);
        }, 16);
      } else if (rect.bottom > window.innerHeight - scrollThreshold) {
        scrollInterval = setInterval(() => {
          window.scrollBy(0, scrollSpeed);
        }, 16);
      }
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }

      const memberName = e.dataTransfer.getData('text/plain');
      const board = zone.dataset.board;
      const position = parseInt(zone.dataset.position);

      // Only remove from the current board's previous position
      if (board === 'goats') {
        // Remove from previous position in goats board only
        Object.keys(goatsBoard).forEach(pos => {
          if (goatsBoard[pos] === memberName) {
            delete goatsBoard[pos];
          }
        });
        goatsBoard[position] = memberName;
      } else {
        // Remove from previous position in toons board only
        Object.keys(toonsBoard).forEach(pos => {
          if (toonsBoard[pos] === memberName) {
            delete toonsBoard[pos];
          }
        });
        toonsBoard[position] = memberName;
      }

      renderBoards();
      updateSummaries();
    });
  });

  document.addEventListener('dragend', () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  });
}

function renderBoards() {
  renderBoard('goats', goatsBoard);
  renderBoard('toons', toonsBoard);
}

function renderBoard(boardType, boardData) {
  const boardElement = document.getElementById(`${boardType}Leaderboard`);
  const dropZones = boardElement.querySelectorAll('.drop-zone');

  dropZones.forEach(zone => {
    const position = parseInt(zone.dataset.position);
    const placeholder = zone.querySelector('.placeholder');

    if (boardData[position]) {
      zone.classList.add('occupied');
      zone.textContent = boardData[position];

      // Add click to remove functionality
      zone.style.cursor = 'pointer';
      zone.onclick = () => {
        delete boardData[position];
        renderBoards();
        updateSummaries();
      };
    } else {
      zone.classList.remove('occupied');
      zone.textContent = '';
      zone.appendChild(placeholder);
      zone.style.cursor = 'default';
      zone.onclick = null;
    }
  });
}

function updateSummaries() {
  updateBoardSummary('goats', goatsBoard);
  updateBoardSummary('toons', toonsBoard);
}

function updateBoardSummary(boardType, boardData) {
  const summaryElement = document.getElementById(`${boardType}Summary`);
  const summaryContent = summaryElement.querySelector('.summary-content');

  let totalPrize = 0;
  let summaryHTML = '';

  const positions = Object.keys(boardData)
    .map(pos => parseInt(pos))
    .sort((a, b) => a - b);

  if (positions.length === 0) {
    summaryHTML = '<div style="color: #999; font-style: italic;">No members assigned yet</div>';
  } else {
    positions.forEach(position => {
      const member = boardData[position];
      const prize = prizeValues[position];
      totalPrize += prize;

      summaryHTML += `
        <div class="summary-item">
          <span>${member} (${position}${getOrdinalSuffix(position)})</span>
          <span>${prize} tons</span>
        </div>
      `;
    });

    summaryHTML += `
      <div class="summary-item">
        <span>Total Expected Prize</span>
        <span>${totalPrize} tons</span>
      </div>
    `;
  }

  summaryContent.innerHTML = summaryHTML;
}

function getOrdinalSuffix(number) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = number % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}

function clearAllBoards() {
  if (confirm('Are you sure you want to clear all leaderboard positions?')) {
    goatsBoard = {};
    toonsBoard = {};
    renderBoards();
    updateSummaries();
  }
}

function calculateExpectedPoints(spending, type) {
  if (type === 'goats') {
    // 750,000 points per 10,000 goats = 75 points per goat
    return Math.round(spending * 75);
  } else if (type === 'tons') {
    // 75 points per ton
    return Math.round(spending * 75);
  }
  return 0;
}

function updateMemberStats(member, type, value) {
  if (!memberStats[member]) {
    memberStats[member] = {
      goats: 0,
      goatPoints: 0,
      tons: 0,
      tonPoints: 0
    };
  }

  // Convert value to number and handle invalid inputs
  const numValue = Number(value) || 0;

  if (type === 'goats') {
    memberStats[member].goats = numValue;
    memberStats[member].goatPoints = calculateExpectedPoints(numValue, 'goats');
  } else if (type === 'tons') {
    memberStats[member].tons = numValue;
    memberStats[member].tonPoints = calculateExpectedPoints(numValue, 'tons');
  }

  renderMemberStats();
  updateStatsSummary();
}

function saveMemberStats(member) {
  const row = document.querySelector(`#memberStatsTable tr[data-member="${member}"]`);
  if (!row) return;

  const goatsInput = row.querySelector('.goats-input');
  const tonsInput = row.querySelector('.tons-input');

  updateMemberStats(member, 'goats', parseFloat(goatsInput.value.replace(/,/g, '')) || 0);
  updateMemberStats(member, 'tons', parseFloat(tonsInput.value) || 0);
}

function resetMemberStats(member) {
  if (memberStats[member]) {
    memberStats[member] = {
      goats: 0,
      goatPoints: 0,
      tons: 0,
      tonPoints: 0
    };
    renderMemberStats();
    updateStatsSummary();
  }
}

function renderMemberStats() {
  const tableBody = document.getElementById('memberStatsTable');
  tableBody.innerHTML = '';

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatTons = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num);
  };

  teamMembers.forEach(member => {
    const stats = memberStats[member] || {
      goats: 0,
      goatPoints: 0,
      tons: 0,
      tonPoints: 0
    };

    const row = document.createElement('tr');
    row.setAttribute('data-member', member);
    row.innerHTML = `
      <td>${member}</td>
      <td>
        <input type="text" class="goats-input" value="${formatNumber(stats.goats)}" 
               onchange="updateMemberStats('${member}', 'goats', this.value.replace(/,/g, ''))" 
               min="0" step="1000" placeholder="Enter goats">
      </td>
      <td class="points">${formatNumber(stats.goatPoints)}</td>
      <td>
        <input type="number" class="tons-input" value="${formatTons(stats.tons)}" 
               onchange="updateMemberStats('${member}', 'tons', this.value)" 
               min="0" step="0.1" placeholder="Enter tons">
      </td>
      <td class="points">${formatNumber(stats.tonPoints)}</td>
      <td class="actions">
        <button class="action-btn save-btn" onclick="saveMemberStats('${member}')">Save</button>
        <button class="action-btn reset-btn" onclick="resetMemberStats('${member}')">Reset</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function updateStatsSummary() {
  const summary = document.querySelector('#statsSummary .summary-content');
  if (!summary) return;

  let totalGoats = 0;
  let totalTons = 0;
  let totalGoatPoints = 0;
  let totalTonPoints = 0;
  let memberCount = Object.keys(memberStats).length;

  Object.values(memberStats).forEach(stats => {
    totalGoats += Number(stats.goats) || 0;
    totalTons += Number(stats.tons) || 0;
    totalGoatPoints += Number(stats.goatPoints) || 0;
    totalTonPoints += Number(stats.tonPoints) || 0;
  });

  const avgGoatPoints = memberCount ? Math.round(totalGoatPoints / memberCount) : 0;
  const avgTonPoints = memberCount ? Math.round(totalTonPoints / memberCount) : 0;

  // Format numbers with proper thousand separators
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(num);
  };

  // Format tons with 1 decimal place
  const formatTons = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num);
  };

  summary.innerHTML = `
    <div class="stats-summary-item">
      <h5>Total Goats Spent</h5>
      <div class="value">${formatNumber(totalGoats)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Total Tons Spent</h5>
      <div class="value">${formatTons(totalTons)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Total Expected Goat Points</h5>
      <div class="value">${formatNumber(totalGoatPoints)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Total Expected Ton Points</h5>
      <div class="value">${formatNumber(totalTonPoints)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Average Goat Points</h5>
      <div class="value">${formatNumber(avgGoatPoints)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Average Ton Points</h5>
      <div class="value">${formatNumber(avgTonPoints)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Points per 10,000 Goats</h5>
      <div class="value">750,000</div>
    </div>
    <div class="stats-summary-item">
      <h5>Points per Ton</h5>
      <div class="value">75</div>
    </div>
  `;
}

function exportStrategy() {
  const strategy = {
    teamMembers: teamMembers,
    goatsStrategy: goatsBoard,
    toonsStrategy: toonsBoard,
    memberStats: memberStats,
    timestamp: new Date().toISOString()
  };

  // Create a formatted text representation
  let exportText = `🏆 TEAM LEADERBOARD STRATEGY\n`;
  exportText += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

  exportText += `👥 TEAM MEMBERS (${teamMembers.length}):\n`;
  teamMembers.forEach(member => {
    const stats = memberStats[member] || { goats: 0, tons: 0, goatPoints: 0, tonPoints: 0 };
    exportText += `• ${member} (Goats: ${stats.goats.toLocaleString()}, Tons: ${stats.tons.toFixed(1)})\n`;
    exportText += `  Expected Points - Goats: ${stats.goatPoints.toLocaleString()}, Tons: ${stats.tonPoints.toLocaleString()}\n`;
  });

  exportText += `\n🐐 GOATS LEADERBOARD STRATEGY:\n`;
  if (Object.keys(goatsBoard).length === 0) {
    exportText += `No positions assigned\n`;
  } else {
    Object.keys(goatsBoard)
      .map(pos => parseInt(pos))
      .sort((a, b) => a - b)
      .forEach(position => {
        exportText += `${position}${getOrdinalSuffix(position)} place: ${goatsBoard[position]} (${prizeValues[position]} tons)\n`;
      });
  }

  exportText += `\n🎨 TOONS LEADERBOARD STRATEGY:\n`;
  if (Object.keys(toonsBoard).length === 0) {
    exportText += `No positions assigned\n`;
  } else {
    Object.keys(toonsBoard)
      .map(pos => parseInt(pos))
      .sort((a, b) => a - b)
      .forEach(position => {
        exportText += `${position}${getOrdinalSuffix(position)} place: ${toonsBoard[position]} (${prizeValues[position]} tons)\n`;
      });
  }

  // Add stats summary with formatted numbers
  exportText += `\n📊 TEAM STATS SUMMARY:\n`;
  let totalGoats = 0, totalTons = 0, totalGoatPoints = 0, totalTonPoints = 0;
  Object.values(memberStats).forEach(stats => {
    totalGoats += stats.goats;
    totalTons += stats.tons;
    totalGoatPoints += stats.goatPoints;
    totalTonPoints += stats.tonPoints;
  });
  exportText += `Total Goats: ${totalGoats.toLocaleString()}\n`;
  exportText += `Total Tons: ${totalTons.toFixed(1)}\n`;
  exportText += `Total Expected Goat Points: ${totalGoatPoints.toLocaleString()}\n`;
  exportText += `Total Expected Ton Points: ${totalTonPoints.toLocaleString()}\n`;
  exportText += `Points Rate - Goats: 750,000 per 10,000 goats\n`;
  exportText += `Points Rate - Tons: 75 per ton\n`;

  // Copy to clipboard
  navigator.clipboard.writeText(exportText).then(() => {
    alert('Strategy copied to clipboard! You can now paste it anywhere to share with your team.');
  }).catch(() => {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = exportText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Strategy copied to clipboard! You can now paste it anywhere to share with your team.');
  });
}

function showImportDialog() {
  const dialog = document.getElementById('importDialog');
  dialog.style.display = 'flex';
  document.getElementById('importText').focus();
}

function closeImportDialog() {
  const dialog = document.getElementById('importDialog');
  dialog.style.display = 'none';
  document.getElementById('importText').value = '';
}

function importStrategy() {
  const importText = document.getElementById('importText').value.trim();
  if (!importText) {
    alert('Please paste your strategy data first.');
    return;
  }

  try {
    // Parse the text data
    const lines = importText.split('\n');
    const strategy = {
      teamMembers: [],
      goatsStrategy: {},
      toonsStrategy: {},
      memberStats: {},
      timestamp: new Date().toISOString()
    };

    let currentSection = '';
    let currentBoard = null;

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      // Detect sections
      if (line.includes('TEAM MEMBERS')) {
        currentSection = 'members';
        return;
      } else if (line.includes('GOATS LEADERBOARD')) {
        currentSection = 'goats';
        currentBoard = strategy.goatsStrategy;
        return;
      } else if (line.includes('TOONS LEADERBOARD')) {
        currentSection = 'toons';
        currentBoard = strategy.toonsStrategy;
        return;
      }

      // Process each section
      if (currentSection === 'members' && line.startsWith('•')) {
        const member = line.substring(1).trim();
        if (member && !strategy.teamMembers.includes(member)) {
          strategy.teamMembers.push(member);
        }
      } else if ((currentSection === 'goats' || currentSection === 'toons') && line.includes('place:')) {
        const match = line.match(/(\d+)(?:st|nd|rd|th) place: ([^(]+) \((\d+\.?\d*) tons\)/);
        if (match) {
          const [_, position, member, tons] = match;
          if (strategy.teamMembers.includes(member.trim())) {
            currentBoard[parseInt(position)] = member.trim();
          }
        }
      }
    });

    // Validate the imported data
    if (!isValidStrategyData(strategy)) {
      throw new Error('Invalid strategy data format');
    }

    // Clear current data
    teamMembers = [];
    goatsBoard = {};
    toonsBoard = {};
    memberStats = {};

    // Import team members
    strategy.teamMembers.forEach(member => {
      if (!teamMembers.includes(member)) {
        teamMembers.push(member);
      }
    });

    // Import board positions
    Object.entries(strategy.goatsStrategy).forEach(([position, member]) => {
      if (teamMembers.includes(member)) {
        goatsBoard[position] = member;
      }
    });

    Object.entries(strategy.toonsStrategy).forEach(([position, member]) => {
      if (teamMembers.includes(member)) {
        toonsBoard[position] = member;
      }
    });

    // Import member stats if available
    if (strategy.memberStats) {
      memberStats = strategy.memberStats;
    } else {
      // Initialize empty stats for imported members
      teamMembers.forEach(member => {
        if (!memberStats[member]) {
          memberStats[member] = {
            goats: 0,
            goatPoints: 0,
            tons: 0,
            tonPoints: 0
          };
        }
      });
    }

    // Update the UI
    renderTeamMembers();
    renderBoards();
    renderMemberStats();
    updateSummaries();
    updateStatsSummary();

    // Close dialog and show success message
    closeImportDialog();
    alert('Strategy imported successfully!');
  } catch (error) {
    console.error('Error importing strategy:', error);
    alert('Error importing strategy: ' + error.message);
  }
}

function isValidStrategyData(data) {
  // Check if the data has the required structure
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.teamMembers)) return false;
  if (!data.goatsStrategy || typeof data.goatsStrategy !== 'object') return false;
  if (!data.toonsStrategy || typeof data.toonsStrategy !== 'object') return false;
  if (!data.memberStats || typeof data.memberStats !== 'object') return false;
  if (!data.timestamp || typeof data.timestamp !== 'string') return false;

  // Validate team members
  if (!data.teamMembers.every(member => typeof member === 'string' && member.trim())) return false;

  // Validate board positions
  const isValidPosition = (pos, member) => {
    const position = parseInt(pos);
    return !isNaN(position) && 
           position >= 1 && 
           position <= 10 && 
           typeof member === 'string' && 
           member.trim() && 
           data.teamMembers.includes(member);
  };

  if (!Object.entries(data.goatsStrategy).every(([pos, member]) => isValidPosition(pos, member))) return false;
  if (!Object.entries(data.toonsStrategy).every(([pos, member]) => isValidPosition(pos, member))) return false;

  return true;
}

// Event listeners
document.getElementById('memberInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTeamMember();
  }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  setupDropZones();
  renderTeamMembers();
  renderBoards();
  renderMemberStats();
  updateSummaries();
  updateStatsSummary();

  // Add some sample team members for demonstration
  const sampleMembers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  sampleMembers.forEach(member => {
    if (!teamMembers.includes(member)) {
      teamMembers.push(member);
      memberStats[member] = {
        goats: 0,
        goatPoints: 0,
        tons: 0,
        tonPoints: 0
      };
    }
  });
  renderTeamMembers();
  renderMemberStats();
});
