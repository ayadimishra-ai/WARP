export interface IBaseTemplateProps {
  text: string;
}

const BaseTemplate: React.FC<IBaseTemplateProps> = ({ text }) => {
  return <div>BaseTemplate - {text}</div>;
};

export default BaseTemplate;
