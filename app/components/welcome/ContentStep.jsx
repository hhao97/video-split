const ContentStep = ({ title, description, icon: Icon, }) => {
    return (<div className="welcome-content-step">
      <Icon />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>);
};
export default ContentStep;
