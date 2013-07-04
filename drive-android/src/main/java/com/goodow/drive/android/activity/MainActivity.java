package com.goodow.drive.android.activity;

import com.goodow.drive.android.R;
import com.goodow.drive.android.auth.DataListFragment;
import com.goodow.drive.android.auth.LeftMenuFragment;
import com.goodow.drive.android.global_data_cache.GlobalDataCacheForMemorySingleton;

import android.app.Fragment;

import android.R.integer;

import android.view.KeyEvent;

import android.widget.Toast;

import android.widget.AdapterView;

import android.widget.AdapterView.OnItemClickListener;

import android.widget.ListView;

import android.widget.LinearLayout;

import android.view.View;

import android.app.FragmentTransaction;

import android.content.DialogInterface;
import android.app.AlertDialog;
import android.view.MenuItem;
import android.view.Menu;
import android.app.ActionBar;
import android.os.Bundle;
import android.app.Activity;

public class MainActivity extends Activity {

  private LinearLayout leftMenu;
  private LinearLayout middleLayout;
  private LeftMenuFragment leftMenuFragment;

  public void hideLeftMenuLayout() {
    if (null != leftMenu && null != middleLayout) {
      leftMenu.setVisibility(LinearLayout.INVISIBLE);
      middleLayout.setVisibility(LinearLayout.INVISIBLE);
    }
  }

  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    super.onCreateOptionsMenu(menu);

    MenuItem back2Login = menu.add(0, 0, 0, R.string.actionBar_back);
    back2Login.setIcon(R.drawable.action_discussion_previous);
    back2Login.setShowAsAction(MenuItem.SHOW_AS_ACTION_IF_ROOM);

    return true;
  }

  @Override
  public boolean onKeyDown(int keyCode, KeyEvent event) {
    if (keyCode == KeyEvent.KEYCODE_BACK) {
      return true;
    }

    return super.onKeyDown(keyCode, event);
  }

  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    super.onOptionsItemSelected(item);

    if (item.getItemId() == android.R.id.home) {
      if (leftMenu.getVisibility() == LinearLayout.VISIBLE) {
        hideLeftMenuLayout();

      } else {
        leftMenu.setVisibility(LinearLayout.VISIBLE);
        middleLayout.setVisibility(LinearLayout.VISIBLE);

      }

    } else if (item.getItemId() == 0) {
      AlertDialog alertDialog = new AlertDialog.Builder(this).setPositiveButton(R.string.dailogOK, new DialogInterface.OnClickListener() {

        @Override
        public void onClick(DialogInterface dialog, int which) {
          GlobalDataCacheForMemorySingleton.getInstance.setUserId(null);
          GlobalDataCacheForMemorySingleton.getInstance.setAccess_token(null);

          finish();
        }
      }).setNegativeButton(R.string.dailogCancel, new DialogInterface.OnClickListener() {

        @Override
        public void onClick(DialogInterface dialog, int which) {

        }
      }).setMessage(R.string.dailogMessage).create();

      alertDialog.show();
    }

    return true;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    ActionBar actionBar = getActionBar();
    actionBar.setDisplayHomeAsUpEnabled(true);

    leftMenu = (LinearLayout) findViewById(R.id.leftMenuLayout);
    middleLayout = (LinearLayout) findViewById(R.id.middleLayout);
    leftMenuFragment = new LeftMenuFragment();

    FragmentTransaction fragmentTransaction = getFragmentManager().beginTransaction();
    fragmentTransaction.add(R.id.leftMenuLayout, leftMenuFragment);
    fragmentTransaction.commit();

    middleLayout.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View v) {
        hideLeftMenuLayout();
      }
    });

  }
}
