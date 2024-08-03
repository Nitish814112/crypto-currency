import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import {
  GET_MONTH_REQUEST,
  GET_MONTH_SUCCESS,
  GET_MONTH_FAILURE,
} from '../component/redux/constant/monthWiseConstant'; 
import monthWiseActions from '../component/redux/action/monthWiseAction'; 

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const store = mockStore({});

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('monthWiseActions', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = new AxiosMockAdapter(axios);
    store.clearActions();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('dispatches GET_MONTH_SUCCESS when fetching monthly data is successful', async () => {
    const mockData = {
      market_data: {
        current_price: {
          usd: 1000,
        },
      },
    };

    // Mock all API calls with a single regex
    mockAxios.onGet(/https:\/\/api\.coingecko\.com\/api\/v3\/coins\/.*\/history\?date=.*&x_cg_demo_api_key=CG-7oPz64yKkP1A7tpRhxTPTkYc/)
      .reply(200, mockData);

    await store.dispatch(monthWiseActions()); 

    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: GET_MONTH_REQUEST });
    expect(actions[1]).toEqual({
      type: GET_MONTH_SUCCESS,
      payload: {
        bitcoin: expect.any(Object),
        ethereum: expect.any(Object),
        tether: expect.any(Object),
        ripple: expect.any(Object),
        binancecoin: expect.any(Object),
      },
    });
  });

  it('dispatches GET_MONTH_FAILURE when fetching monthly data fails', async () => {
    mockAxios.onGet(/https:\/\/api\.coingecko\.com\/api\/v3\/coins\/.*\/history\?date=.*&x_cg_demo_api_key=CG-7oPz64yKkP1A7tpRhxTPTkYc/)
      .reply(500, { message: 'Error fetching data' });

    await store.dispatch(monthWiseActions()); 

    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: GET_MONTH_REQUEST });
    expect(actions[1]).toEqual({
      type: GET_MONTH_FAILURE,
      payload: 'Error fetching data',
    });
  });
});
