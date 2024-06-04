import React, { ReactNode } from 'react';
import { Accordion, AccordionProps } from 'hds-react';

interface MyComponentProps {
  children: ReactNode;
  heading: string;
  id: string;
}

function UserGuideAccordion({
  children,
  id,
  heading,
}: MyComponentProps): React.ReactElement {
  const accordionStyle = {
    maxWidth: '800px',
    borderTop: 0,
    borderBottom: 1,
    border: 'solid 1px #ffffff',
  };

  const theme = {
    '--background-color': '#F2F2F2',
  };

  const accordionProps: AccordionProps = {
    style: accordionStyle,
    size: 'l',
    card: true,
    language: 'en',
    theme,
  };

  return (
    <Accordion id={id} heading={heading} {...accordionProps}>
      {children}
    </Accordion>
  );
}

export default UserGuideAccordion;
