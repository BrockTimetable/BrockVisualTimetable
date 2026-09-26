import PropTypes from "prop-types";

export default function BorderBox({ title, children }) {
  return (
    <section className="workspace-section">
      <h2 className="workspace-section-title">{title}</h2>
      <div className="workspace-section-body">{children}</div>
    </section>
  );
}

BorderBox.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
