import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import React, { Component } from 'react';
import SupplierDetails from './SupplierDetails';
class SupplierName extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            opensupplierinfo: false,
            anchorEl: null
        };
    }
    handleOpenSupplierInfo = () => {
        this.setState({ opensupplierinfo: true });
    };

    handleCloseSupplierInfo = () => {
        this.setState({ opensupplierinfo: false });
    };
    handleClick = (event) => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };

    render() {
 
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        return (
            <React.Fragment>
                <div>
                    <section>
                        {/* <span>Type:</span>
                        <span><b>{this.props.Material}</b></span> */}
                       

                         {this.props.CategoryName!==undefined && this.props.CategoryName!==null && this.props.CategoryName!=="" && this.props.showonTooltip !== true ?
                            <div className="proddet_categoryname">
                                <span>{this.props.CategoryName}</span>
                            </div>
                        :""}
                       {this.props.showonTooltip !== true ?                         
                        <div className="proddet_skucode">
                            <span>SKU ID:</span>
                            <span><b>{this.props.SkuCode}</b></span>
                        </div>
                        :""}

                        <div className="proddet_supplrnm">
                            <span>Supplier:</span>
                            {this.props.RoleCode.includes("BUYER")?
                            <a onClick={this.handleOpenSupplierInfo} className=""><b>{this.props.Name}</b></a>
                            :<span><b>{this.props.Name}</b></span>}
                        </div>

                    </section>
                </div>
                <Dialog
                open={this.state.opensupplierinfo}
                onClose={this.handleCloseSupplierInfo}
                fullWidth={true}
                maxWidth="lg"
                PaperProps={{className:'supplierinfo_popupcont'}}>
                
                <DialogTitle id="scroll-dialog-title" className='suppinfopop_heading'>
                    Supplier Information
                    <IconButton className="suppinfopop_closebtn" aria-label="close" onClick={this.handleCloseSupplierInfo}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent className="dialogueContent">
                    <DialogContentText>
                            <SupplierDetails
                                SupplierName={this.props.Name}
                                SupplierAddress={this.props.SupplierAddress}
                                SupplierCertificates={this.props.SupplierCertificates}
                                eScore={this.props.eScore}
                                gScore={this.props.gScore}
                                sScore={this.props.sScore}
                                eSGScore={this.props.eSGScore}
                                SupplierCompanyGuid={this.props.supplierCompanyGuid}
                                AssessmentDate={this.props.AssessmentDate}
                                supplierGSTNumber={this.props.supplierGSTNumber}
                                supplierCategories={this.props.supplierCategories}
                            />
                    </DialogContentText>
                </DialogContent>
                                    
            </Dialog>
            </React.Fragment>
        )
    }
}
export default (SupplierName);