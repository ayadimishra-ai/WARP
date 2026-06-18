import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { Dialog, DialogContent, IconButton, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import LockIcon from '@material-ui/icons/Lock';

export const showLockUpPopup = (itemData = null) => {
  // Default content
  const defaultContent = {
    heading: "This feature is not enabled",
    description: "This feature is part of Snowkap's AI-powered ESG platform. Contact us for a walkthrough of advanced Scope 3 emissions calculation, S&G insights, and data collection through API, and AI based methods. Snowkap also provides AI-assisted reporting across frameworks like BRSR and ESRS, featuring automated data mapping and ready-to-review disclosures. The platform offers a complete suite of assessments, including supplier assessments, materiality assessments, and custom ESG assessments with automated scoring to streamline data collection, evaluate risks, and generate actionable insights."
  };

  // Dynamic content based on item
  let content = defaultContent;
  
  if (itemData) {
    // First check for specific activity names
    const activity = itemData.activity || '';
    const activityLower = activity.toLowerCase();
    
    // Specific content for each item
    if (activityLower.includes('material procurement') || activityLower.includes('material')) {
      content = {
        heading: "Material Procurement - Template not enabled",
        description: "Scope 3 Category 1 - This template supports emissions associated with materials purchased across the supply chain by capturing quantities, categories, and upstream footprint."
      };
    } else if (activityLower.includes('upstream transport') || activityLower.includes('upstream')) {
      content = {
        heading: "Upstream Transportation - Template not enabled", 
        description: "Scope 3 Category 4 - This template supports emissions associated with inbound logistics and supplier-side transportation."
      };
    } else if (activityLower.includes('downstream transport') || activityLower.includes('downstream')) {
      content = {
        heading: "Downstream Transportation - Template not enabled",
        description: "Scope 3 Category 9 - This template supports emissions associated with outbound distribution of goods to customers and distributors."
      };
    } else if (activityLower.includes('business travel')) {
      content = {
        heading: "Business Travel - Template not enabled",
        description: "Scope 3 Category 6 - This template supports emissions associated with business related travel across all modes including air, road, and rail."
      };
    } else if (activityLower.includes('employee commute') || activityLower.includes('employee travel')) {
      content = {
        heading: "Employee Commute - Template not enabled",
        description: "Scope 3 Category 7 - This template supports emissions associated with employee commuting to and fro workplace."
      };
    } else if (activityLower.includes('waste management') || activityLower.includes('waste data')) {
      content = {
        heading: "Waste Management - Template not enabled",
        description: "Scope 3 Category 5 - This template supports emissions associated with disposal and transportation of the waste generated."
      };
    } else if (activityLower.includes('production details') || activityLower.includes('production')) {
      content = {
        heading: "Production Details - Template not enabled",
        description: "This template captures operational activity data and supports intensity related insights."
      };
    } else if (activityLower.includes('water consumption')) {
      content = {
        heading: "Water Consumption - Template not enabled",
        description: "This template captures water consumption trends and usage across processes."
      };
    } else if (activityLower.includes('wastewater generation')) {
      content = {
        heading: "Wastewater Generation - Template not enabled",
        description: "This template supports reporting on wastewater generation."
      };
    } else if (activityLower.includes('wastewater treatment') || activityLower.includes('waste water treatment')) {
      content = {
        heading: "Wastewater Treatment - Template not enabled",
        description: "This template supports reporting on wastewater treatment methods and discharge parameters."
      };
    } else if (activityLower.includes('water withdrawal')) {
      content = {
        heading: "Water Withdrawal - Template not enabled",
        description: "This template supports reporting on trends and sources of water withdrawal."
      };
    } else if (activityLower.includes('human resource') || activityLower.includes('hr')) {
      content = {
        heading: "Human Resource - Template not enabled",
        description: "This template supports reporting on workforce related information including diversity, retention, training, and development indicators."
      };
    } else if (activityLower.includes('fugitive emissions') || activityLower.includes('fugitive')) {
      content = {
        heading: "Fugitive Emissions - Template not enabled",
        description: "Scope 1 - This template supports reporting emissions from leakage of refrigerants, chemicals, or industrial gases."
      };
    } else if (activityLower.includes('governance')) {
      content = {
        heading: "Governance - Template not enabled",
        description: "This template supports reporting on governance structure, board oversight, and compliance."
      };
    } else if (activityLower.includes('health') || activityLower.includes('safety')) {
      content = {
        heading: "Health & Safety - Template not enabled",
        description: "This template supports reporting on safety incidents, training programs, and workplace risk management activities."
      };
    } else if (activityLower.includes('grievances')) {
      content = {
        heading: "Grievances - Template not enabled",
        description: "This template supports reporting on grievances, resolution timelines, and stakeholder interactions."
      };
    } else if (activityLower.includes('csr')) {
      content = {
        heading: "CSR - Template not enabled",
        description: "This template supports reporting on CSR initiatives, projects, community engagement."
      };
    } else if (activityLower.includes('ai electricity') || activityLower.includes('electricity') || activityLower.includes('ai-powered')) {
      content = {
        heading: "AI electricity Upload - Section not enabled",
        description: "Scope 2 - This section automatically extracts consumption units from electricity bills uploaded onto Snowkap platform using AI. Emissions are calculated using the extracted data."
      };
    } else if (activityLower.includes('energy grid') || activityLower.includes('grid')) {
      content = {
        heading: "Energy Grid - Template not enabled",
        description: "Scope 2 (Location Based) - This template supports emissions associated with electricity consumed by the organization, including grid-supplied electricity as well as renewable electricity sourced through Power Purchase Agreements (PPAs) and Renewable Energy Certificates (RECs)."
      };
    } else if (activityLower.includes('energy captive') || activityLower.includes('captive')) {
      content = {
        heading: "Energy Captive - Template not enabled",
        description: "Scope 1 - This template supports emissions associated with energy consumption from owned captive power plants. It captures electricity consumed from captive sources, including both renewable (e.g., solar, wind, biomass) and non-renewable (e.g., coal, gas, diesel) energy."
      };
    } else if (activityLower.includes('fuel consumption') || activityLower.includes('fuel')) {
      content = {
        heading: "Fuel Consumption - Template not enabled",
        description: "Scope 1 – This template supports emissions associated with direct fuel use within organizational operations. It captures the type of fuel consumed (e.g., diesel, petrol, LPG, natural gas), quantity consumed, and the application where it is used—such as direct operational processes, DG sets, water heating, and internal transportation within premises."
      };
    } else if (activityLower.includes('general details') || activityLower.includes('general')) {
      content = {
        heading: "General Details - Template not enabled",
        description: "Cross-cutting – This template supports emissions calculations and intensity metrics by capturing generic organizational and operational information."
      };
    } else if (activityLower.includes('buyer share') || activityLower.includes('buyer')) {
      content = {
        heading: "Buyer Share - Template not enabled",
        description: "This template is used for primary data collection from suppliers to determine the buyer's share of business. Suppliers are required to provide the percentage of business attributable to the buyer, along with a selectable rationale explaining how the percentage has been derived, ensuring transparency and consistency in data allocation."
      };
    } else if (activityLower.includes('supplier details')) {
      content = {
        heading: "Supplier Details - Template not enabled",
        description: "This template supports comprehensive supplier information management including supplier profiles, ESG assessments, and supply chain transparency reporting."
      };
    } else {
      // Fallback to type-based content for unmatched items
      switch (itemData.type) {
        case 'upload':
          content = {
            heading: `${itemData.activity || 'Upload'} - Premium Feature`,
            description: `The ${itemData.activity || 'upload'} functionality is part of our premium ESG platform. This feature enables advanced data upload capabilities with AI-powered validation and automated processing. Contact us to unlock this feature and streamline your ${itemData.activity || 'data'} management process.`
          };
          break;
        case 'download':
          content = {
            heading: `${itemData.activity || 'Download'} Template - Premium Feature`,
            description: `The ${itemData.activity || 'download'} template is part of our comprehensive ESG toolkit. This template provides industry-specific data collection formats with automated validation rules. Contact us to access this premium template and enhance your data collection efficiency.`
          };
          break;
        case 'assessment':
          content = {
            heading: "Assessment Feature Locked",
            description: "This assessment module is part of our advanced ESG platform. Access comprehensive assessment tools with AI-powered insights, automated scoring, and detailed analytics. Contact us to unlock this premium assessment capability."
          };
          break;
        case 'dashboard':
          content = {
            heading: "Dashboard Feature Locked", 
            description: "This dashboard view is part of our premium analytics suite. Access advanced visualization tools, real-time data insights, and comprehensive reporting capabilities. Contact us to unlock this premium dashboard feature."
          };
          break;
        default:
          // Keep default content
          break;
      }
    }
  }

  confirmAlert({
    customUI: ({ onClose }) => (
      <div className="lockup-popup-container">
        <div className="lockup-popup-content">
          {/* Close Button */}
          <IconButton 
            className="lockup-popup-close" 
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>

          {/* Lock Icon */}
          <div className="lockup-popup-icon">
            <LockIcon />
          </div>

          {/* Heading */}
          <h2 className="lockup-popup-heading">{content.heading}</h2>

          {/* Description */}
          <p className="lockup-popup-description">
            {content.description}
          </p>
          <p className="lockup-popup-contact">
            For detailed walkthrough, contact Snowkap at{' '}
            <a 
              href="mailto:supportnow@snowkap.com"
              style={{
                color: '#00B8BA',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              supportnow@snowkap.com
            </a>{' '}
            or{' '}
            022-40079311
          </p>

          {/* Video Section */}
          {/* <div className="lockup-popup-video">
            <iframe
              width="100%"
              height="200"
              src="https://www.youtube.com/embed/PVzROBUWqRQ?rel=0&showinfo=0&modestbranding=1"
              title="Sustainability Journey Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            ></iframe>
          </div> */}

          {/* Action Buttons */}
          <div className="lockup-popup-actions">
            <Button 
              className="lockup-popup-btn-primary"
              variant="contained"
              onClick={() => {
                window.location.href = 'mailto:supportnow@snowkap.com?subject=Schedule a Demo - Snowkap ESG Platform&body=Hi,%0A%0AI would like to schedule a demo of the Snowkap ESG platform.%0A%0AThank you.';
              }}
            >
              SCHEDULE A DEMO
            </Button>
            
          </div>

          {/* Features */}
          {/* <div className="lockup-popup-features">
            <div className="lockup-popup-feature">
              ✓ BRSR & ESRS compliant
            </div>
            <div className="lockup-popup-feature">
              ✓ AI-powered reporting
            </div>
            <div className="lockup-popup-feature">
              ✓ GRI framework support
            </div>
          </div> */}
        </div>
      </div>
    ),
    overlayClassName: "lockup-popup-overlay"
  });
};

// Alternative Modal version using Material-UI Dialog
export const showLockUpModal = (isOpen, onClose, itemData = null) => {
  // Default content
  const defaultContent = {
    heading: "This feature is not enabled",
    description: "This feature is part of Snowkap's AI-powered ESG platform. Contact us for a walkthrough of advanced Scope 3 emissions calculation, S&G insights, and data collection through API, and AI based methods. Snowkap also provides AI-assisted reporting across frameworks like BRSR and ESRS, featuring automated data mapping and ready-to-review disclosures. The platform offers a complete suite of assessments, including supplier assessments, materiality assessments, and custom ESG assessments with automated scoring to streamline data collection, evaluate risks, and generate actionable insights."
  };

  // Dynamic content based on item
  let content = defaultContent;
  
  if (itemData) {
    // First check for specific activity names
    const activity = itemData.activity || '';
    const activityLower = activity.toLowerCase();
    
    // Specific content for each item
    if (activityLower.includes('material procurement') || activityLower.includes('material')) {
      content = {
        heading: "Material Procurement - Template not enabled",
        description: "Scope 3 Category 1 - This template supports emissions associated with materials purchased across the supply chain by capturing quantities, categories, and upstream footprint."
      };
    } else if (activityLower.includes('upstream transport') || activityLower.includes('upstream')) {
      content = {
        heading: "Upstream Transportation - Template not enabled", 
        description: "Scope 3 Category 4 - This template supports emissions associated with inbound logistics and supplier-side transportation."
      };
    } else if (activityLower.includes('downstream transport') || activityLower.includes('downstream')) {
      content = {
        heading: "Downstream Transportation - Template not enabled",
        description: "Scope 3 Category 9 - This template supports emissions associated with outbound distribution of goods to customers and distributors."
      };
    } else if (activityLower.includes('business travel')) {
      content = {
        heading: "Business Travel - Template not enabled",
        description: "Scope 3 Category 6 - This template supports emissions associated with business related travel across all modes including air, road, and rail."
      };
    } else if (activityLower.includes('employee commute') || activityLower.includes('employee travel')) {
      content = {
        heading: "Employee Commute - Template not enabled",
        description: "Scope 3 Category 7 - This template supports emissions associated with employee commuting to and fro workplace."
      };
    } else if (activityLower.includes('waste management') || activityLower.includes('waste data')) {
      content = {
        heading: "Waste Management - Template not enabled",
        description: "Scope 3 Category 5 - This template supports emissions associated with disposal and transportation of the waste generated."
      };
    } else if (activityLower.includes('production details') || activityLower.includes('production')) {
      content = {
        heading: "Production Details - Template not enabled",
        description: "This template captures operational activity data and supports intensity related insights."
      };
    } else if (activityLower.includes('water consumption')) {
      content = {
        heading: "Water Consumption - Template not enabled",
        description: "This template captures water consumption trends and usage across processes."
      };
    } else if (activityLower.includes('wastewater generation')) {
      content = {
        heading: "Wastewater Generation - Template not enabled",
        description: "This template supports reporting on wastewater generation."
      };
    } else if (activityLower.includes('wastewater treatment') || activityLower.includes('waste water treatment')) {
      content = {
        heading: "Wastewater Treatment - Template not enabled",
        description: "This template supports reporting on wastewater treatment methods and discharge parameters."
      };
    } else if (activityLower.includes('water withdrawal')) {
      content = {
        heading: "Water Withdrawal - Template not enabled",
        description: "This template supports reporting on trends and sources of water withdrawal."
      };
    } else if (activityLower.includes('human resource') || activityLower.includes('hr')) {
      content = {
        heading: "Human Resource - Template not enabled",
        description: "This template supports reporting on workforce related information including diversity, retention, training, and development indicators."
      };
    } else if (activityLower.includes('fugitive emissions') || activityLower.includes('fugitive')) {
      content = {
        heading: "Fugitive Emissions - Template not enabled",
        description: "Scope 1 - This template supports reporting emissions from leakage of refrigerants, chemicals, or industrial gases."
      };
    } else if (activityLower.includes('governance')) {
      content = {
        heading: "Governance - Template not enabled",
        description: "This template supports reporting on governance structure, board oversight, and compliance."
      };
    } else if (activityLower.includes('health') || activityLower.includes('safety')) {
      content = {
        heading: "Health & Safety - Template not enabled",
        description: "This template supports reporting on safety incidents, training programs, and workplace risk management activities."
      };
    } else if (activityLower.includes('grievances')) {
      content = {
        heading: "Grievances - Template not enabled",
        description: "This template supports reporting on grievances, resolution timelines, and stakeholder interactions."
      };
    } else if (activityLower.includes('csr')) {
      content = {
        heading: "CSR - Template not enabled",
        description: "This template supports reporting on CSR initiatives, projects, community engagement."
      };
    } else if (activityLower.includes('ai electricity') || activityLower.includes('electricity') || activityLower.includes('ai-powered')) {
      content = {
        heading: "AI electricity Upload - Section not enabled",
        description: "Scope 2 - This section automatically extracts consumption units from electricity bills uploaded onto Snowkap platform using AI. Emissions are calculated using the extracted data."
      };
    } else if (activityLower.includes('energy grid') || activityLower.includes('grid')) {
      content = {
        heading: "Energy Grid - Template not enabled",
        description: "Scope 2 (Location Based) - This template supports emissions associated with electricity consumed by the organization, including grid-supplied electricity as well as renewable electricity sourced through Power Purchase Agreements (PPAs) and Renewable Energy Certificates (RECs)."
      };
    } else if (activityLower.includes('energy captive') || activityLower.includes('captive')) {
      content = {
        heading: "Energy Captive - Template not enabled",
        description: "Scope 1 - This template supports emissions associated with energy consumption from owned captive power plants. It captures electricity consumed from captive sources, including both renewable (e.g., solar, wind, biomass) and non-renewable (e.g., coal, gas, diesel) energy."
      };
    } else if (activityLower.includes('fuel consumption') || activityLower.includes('fuel')) {
      content = {
        heading: "Fuel Consumption - Template not enabled",
        description: "Scope 1 – This template supports emissions associated with direct fuel use within organizational operations. It captures the type of fuel consumed (e.g., diesel, petrol, LPG, natural gas), quantity consumed, and the application where it is used—such as direct operational processes, DG sets, water heating, and internal transportation within premises."
      };
    } else if (activityLower.includes('general details') || activityLower.includes('general')) {
      content = {
        heading: "General Details - Template not enabled",
        description: "Cross-cutting – This template supports emissions calculations and intensity metrics by capturing generic organizational and operational information."
      };
    } else if (activityLower.includes('buyer share') || activityLower.includes('buyer')) {
      content = {
        heading: "Buyer Share - Template not enabled",
        description: "This template is used for primary data collection from suppliers to determine the buyer's share of business. Suppliers are required to provide the percentage of business attributable to the buyer, along with a selectable rationale explaining how the percentage has been derived, ensuring transparency and consistency in data allocation."
      };
    } else if (activityLower.includes('supplier details') || activityLower.includes('supplier')) {
      content = {
        heading: "Supplier Details - Template not enabled",
        description: "This template supports comprehensive supplier information management including supplier profiles, ESG assessments, and supply chain transparency reporting."
      };
    } else {
      // Fallback to type-based content for unmatched items
      switch (itemData.type) {
        case 'upload':
          content = {
            heading: `${itemData.activity || 'Upload'} - Premium Feature`,
            description: `The ${itemData.activity || 'upload'} functionality is part of our premium ESG platform. This feature enables advanced data upload capabilities with AI-powered validation and automated processing. Contact us to unlock this feature and streamline your ${itemData.activity || 'data'} management process.`
          };
          break;
        case 'download':
          content = {
            heading: `${itemData.activity || 'Download'} Template - Premium Feature`,
            description: `The ${itemData.activity || 'download'} template is part of our comprehensive ESG toolkit. This template provides industry-specific data collection formats with automated validation rules. Contact us to access this premium template and enhance your data collection efficiency.`
          };
          break;
        case 'assessment':
          content = {
            heading: "Assessment Feature Locked",
            description: "This assessment module is part of our advanced ESG platform. Access comprehensive assessment tools with AI-powered insights, automated scoring, and detailed analytics. Contact us to unlock this premium assessment capability."
          };
          break;
        case 'dashboard':
          content = {
            heading: "Dashboard Feature Locked", 
            description: "This dashboard view is part of our premium analytics suite. Access advanced visualization tools, real-time data insights, and comprehensive reporting capabilities. Contact us to unlock this premium dashboard feature."
          };
          break;
        default:
          // Keep default content
          break;
      }
    }
  }

  return (
  <Dialog
    open={isOpen}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      style: {
        borderRadius: '20px',
        padding: '0',
        overflow: 'visible'
      }
    }}
  >
    <DialogContent style={{ padding: 0 }}>
      <div className="lockup-popup-container">
        <div className="lockup-popup-content">
          {/* Close Button */}
          <IconButton 
            className="lockup-popup-close closebtn" 
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>

          {/* Lock Icon */}
          <div className="lockup-popup-icon">
            <LockIcon />
          </div>

          {/* Heading */}
          <h2 className="lockup-popup-heading">{content.heading}</h2>

          {/* Description */}
          <p className="lockup-popup-description">
            {content.description}
          </p>
          <p className="lockup-popup-contact">
            For detailed walkthrough, contact Snowkap at{' '}
            <a 
              href="mailto:supportnow@snowkap.com"
              style={{
                color: '#00B8BA',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              supportnow@snowkap.com
            </a>{' '}
            or{' '}
            <a 
              href="tel:+912240079311"
              style={{
                color: '#00B8BA',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              022-40079311
            </a>
          </p>

          {/* Video Section */}
          {/* <div className="lockup-popup-video">
            <iframe
              width="100%"
              height="200"
              src="https://www.youtube.com/embed/PVzROBUWqRQ?rel=0&showinfo=0&modestbranding=1"
              title="Sustainability Journey Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            ></iframe>
          </div> */}

          {/* Action Buttons */}
          <div className="lockup-popup-actions">
            <Button 
              className="lockup-popup-btn-primary"
              variant="contained"
              onClick={() => {
                window.location.href = 'mailto:supportnow@snowkap.com?subject=Schedule a Demo - Snowkap ESG Platform&body=Hi,%0A%0AI would like to schedule a demo of the Snowkap ESG platform.%0A%0AThank you.';
              }}
            >
              SCHEDULE A DEMO
            </Button>
            
          </div>

          {/* Features */}
          {/* <div className="lockup-popup-features">
            <div className="lockup-popup-feature">
              ✓ BRSR & ESRS compliant
            </div>
            <div className="lockup-popup-feature">
              ✓ AI-powered reporting
            </div>
            <div className="lockup-popup-feature">
              ✓ GRI framework support
            </div>
          </div> */}
        </div>
      </div>
    </DialogContent>
  </Dialog>
  );
};