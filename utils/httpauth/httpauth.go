package httpauth

import (
	"github.com/sipcapture/homer-app/model"
	"net/http"

	"github.com/go-resty/resty/v2"
)

type Client struct {
	URL                string
	InsecureSkipVerify bool
}

func (rs *Client) Authenticate(username, password string) (*model.HTTPAUTHResp, error) {
	client := resty.New()
	// POST JSON string
	// No need to set content type, if you have client level setting
	resp, err := client.R().
		SetResult(model.HTTPAUTHResp{}).
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{"username": username, "password": password}).
		//SetResult(&AuthSuccess{}).    // or SetResult(AuthSuccess{}).
		Post(rs.URL)

	if err != nil || resp.StatusCode() != http.StatusOK {
		return nil, err
	}

	return resp.Result().(*model.HTTPAUTHResp), nil
}
