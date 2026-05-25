import '@/styles/config-menu.css';

function ToggleButton({ id, value, label, icon, onToggle }) {
  return (
    <button
      id={id}
      className={`toggle-btn ${value ? 'active' : ''}`}
      onClick={() => onToggle(!value)}
    >
      {label && <span className="btn-text">{label}</span>}
      {icon && <img className="btn-icon" src={icon} alt="" aria-hidden="true" />}
    </button>
  );
}

export default function ConfigMenu({
  showRetirement,
  setShowRetirement,
  showBareBones,
  setShowBareBones,
  hide,
  setHide,
  githubSync
}) {
  const styles = {"display": "flex", "justifyContent": "center"};
  const syncBusy = githubSync?.status?.type === "pending";
  return (
    <div style={styles}>
      <div className="config-menu"> 
        <ToggleButton
          id="retirement-toggle"
          value={showRetirement}
          onToggle={setShowRetirement}
          label="Enable retirement home items"
          icon="https://oldschool.runescape.wiki/images/Collection_log.png"
        />
        <ToggleButton
          id="bare-bones-toggle"
          value={showBareBones}
          onToggle={setShowBareBones}
          label="Enable bare bones mode"
          icon="https://oldschool.runescape.wiki/images/Bones.png"
        />
        <ToggleButton
          id="hide-skill"
          value={hide.skill}
          onToggle={v => setHide(prev => ({ ...prev, skill: v }))}
          label="Hide levels"
          icon="https://oldschool.runescape.wiki/images/Stats_icon.png"
        />
        <ToggleButton
          id="hide-construction"
          value={hide.construction}
          onToggle={v => setHide(prev => ({ ...prev, construction: v }))}
          label="Hide Construction milestones"
          icon="https://oldschool.runescape.wiki/images/Construction_icon.png"
        />
        <ToggleButton
          id="hide-slayer"
          value={hide.slayer}
          onToggle={v => setHide(prev => ({ ...prev, slayer: v }))}
          label="Hide slayer rewards"
          icon="https://oldschool.runescape.wiki/images/Slayer_icon.png"
        />
        {githubSync && (
          <div className="github-sync-panel">
            <label className="github-sync-token">
              <span>GitHub token</span>
              <input
                type="password"
                value={githubSync.token}
                onChange={event => githubSync.onTokenChange(event.target.value)}
                placeholder="Fine-grained token"
                autoComplete="off"
              />
            </label>
            <label className="github-sync-remember">
              <input
                type="checkbox"
                checked={githubSync.rememberToken}
                onChange={event => githubSync.onRememberTokenChange(event.target.checked)}
              />
              <span>Remember token on this browser</span>
            </label>
            <div className="github-sync-actions">
              <button type="button" onClick={githubSync.onLoad} disabled={syncBusy}>
                Load from GitHub
              </button>
              <button type="button" onClick={githubSync.onSave} disabled={syncBusy}>
                Save to GitHub
              </button>
            </div>
            <p className={`github-sync-status ${githubSync.status.type}`}>
              {githubSync.status.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
