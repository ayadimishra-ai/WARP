import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getServiceUrl,  getAWSUrl, getWebsiteUrl } from "../../config";



class Blog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      blogList: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getData();
  }

  async getData() {
    await axios
      .get("https://snowkap.com/wp-json/wp/v2/posts")
      .then((res) => {
        this.setState({ blogList: res.data });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  render() {
    const { blogList } = this.state;
    let awsURL = getAWSUrl();
    let websiteURL = getWebsiteUrl();
    return (
      <React.Fragment>
        {blogList.length ? (
          <div className="blogpost_section">
            <div className="section_heading">Insight & Resources</div>
            <GridContainer className="blogpostcont_wrap">
              {blogList.slice(0, 3).map((post, index) => (
                <GridItem md={4}>
                  <div className="blog_img">
                    {/*                          <img src={post.yoast_head_json.og_image[0].url}*/}
                    {/* <img src={(index === 0 && 'https://ewizgreen-alpha.s3.amazonaws.com/BlogImages/beauty-lab.jpg') || (index === 1 && 'https://ewizgreen-alpha.s3.amazonaws.com/BlogImages/changing-world.jpg') || (index === 2 && 'https://ewizgreen-alpha.s3.amazonaws.com/BlogImages/scope3-emmision.jpg')} */}
                    <img src={(index === 0 && websiteURL+'BlogImages/beauty-lab.jpg') || (index === 1 && websiteURL+'BlogImages/changing-world.jpg') || (index === 2 && websiteURL+'BlogImages/scope3-emmision.jpg')}
                      alt=""
                    />
                  </div>

                  <div className="blog_content">
                    <div className="blog_date">
                      <span>
                        {post.date != null
                          ? moment(post.date).format("Do MMM YYYY")
                          : ""}
                      </span>
                    </div>
                    <div className="blog_title">
                      {post.title.rendered}
                    </div>
                    <a target="_blank" href={post.link}>Know More</a>
                  </div>
                </GridItem>
              ))}
            </GridContainer>
          </div>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}
export default Blog;